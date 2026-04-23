import { CronJob } from "cron";
import http from "http";
import { prisma } from "../prisma/client";
import { GatePassStatus } from "@prisma/client";

// Keep server alive by pinging itself every 14 minutes
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`;

const keepAliveJob = new CronJob("*/14 * * * *", function () {
  if (!API_URL) {
    console.error("API_URL is not defined.");
    return;
  }

  http
    .get(API_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

// Auto-reject pending outpass requests at 11:30 PM IST every day
const autoRejectJob = new CronJob("30 23 * * *", async function () {
  try {
    console.log("🕐 Running auto-rejection job for pending outpass requests...");
    
    // Get current date in IST timezone
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + istOffset);
    
    // Calculate start of current day in IST
    const startOfDay = new Date(istTime);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Calculate end of current day in IST
    const endOfDay = new Date(istTime);
    endOfDay.setHours(23, 59, 59, 999);
    
    console.log(`📅 Processing requests from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    
    // Find all pending outpass requests from today
    const pendingPasses = await prisma.gatePass.findMany({
      where: {
        status: GatePassStatus.PENDING,
        appliedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        mentor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (pendingPasses.length === 0) {
      console.log("✅ No pending outpass requests found for auto-rejection");
      return;
    }

    console.log(`📋 Found ${pendingPasses.length} pending requests to auto-reject`);

    // Update all pending requests to REJECTED
    const result = await prisma.gatePass.updateMany({
      where: {
        id: {
          in: pendingPasses.map(pass => pass.id)
        }
      },
      data: {
        status: GatePassStatus.REJECTED,
        updatedAt: istTime
      }
    });

    console.log(`✅ Auto-rejected ${result.count} pending outpass requests at end of day`);
    
    // Log the details for audit purposes (without showing notifications to students)
    pendingPasses.forEach(pass => {
      console.log(`📋 Auto-rejected: ${pass.student.name} (${pass.reason}) - Applied at ${pass.appliedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    });

    console.log("🔕 Auto-rejection completed silently (no notifications sent to students)");

  } catch (error) {
    console.error("❌ Error in auto-rejection job:", error);
  }
}, null, true, "Asia/Kolkata"); // Set timezone to IST

// Export both jobs
export { keepAliveJob, autoRejectJob };

// For backward compatibility, export the keep alive job as default
export default keepAliveJob;
