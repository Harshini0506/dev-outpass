import { Request, Response } from 'express';
import { prisma } from '../prisma/client';
import QRCode from 'qrcode';
import { smsService } from '../utils/sms.util';
import { API_BASE_URL } from '../config';

export async function applyGatePass(req: Request, res: Response): Promise<any> {
  const user = (req as any).user;
  const { reason } = req.body;

  console.log('reason', reason);

  // Check for authenticated user
  if (!user) {
    console.log('⚠️ No authenticated user found - authentication required');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please login to apply for gate pass'
    });
  }

  if (!reason || reason.trim().length < 3) {
    return res.status(400).json({ error: 'Reason must be meaningful.' });
  }

  try {
    const mentorMap = await prisma.studentMentor.findFirst({
      where: {
        student: {
          email: user.email.toLowerCase(),
        },
      },
      include: {
        mentor: true,
      },
    });

    if (!mentorMap?.mentor?.email) {
      return res.status(400).json({ error: 'No mentor assigned' });
    }

    const gatePass = await prisma.gatePass.create({
      data: {
        reason,
        status: 'PENDING',
        student: {
          connect: {
            email: user.email.toLowerCase(),
          },
        },
        mentor: {
          connect: {
            email: mentorMap.mentor.email.toLowerCase(),
          },
        },
      },
    });

    // Send SMS notifications to mentor and parent
    try {
      const student = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() }
      });

      const mentor = await prisma.user.findUnique({
        where: { email: mentorMap.mentor.email.toLowerCase() }
      });

      if (student?.name) {
        // Send notification ONLY to mentor (not parent)
        const mentorMobile = (mentor as any)?.mobile || '';
        if (mentorMobile && mentor?.name) {
          // Extract roll number from email (assuming format: rollno@domain.com)
          const rollno = student.email.split('@')[0];
          await smsService.sendMentorNotification(mentor.name, student.name, rollno, reason, mentorMobile);
        }
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError);
      // Don't fail the request if SMS fails
    }

    res.status(201).json({ message: 'Submitted', gatePass });
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getStudentStatus(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    // If no user is authenticated, return empty array
    if (!user) {
      console.log('⚠️ No authenticated user found - returning empty passes');
      return res.json({ 
        passes: [],
        message: 'No authenticated user - please login to see your passes'
      });
    }

    const passes = await prisma.gatePass.findMany({
      where: { student: { email: user.email.toLowerCase() } },
      orderBy: { appliedAt: 'desc' },
    });

    const enhanced = await Promise.all(
      passes.map(async (p) => {
        if (p.status === 'APPROVED' && p.qrToken) {
          const url = `${API_BASE_URL}/security/scan/${p.id}/${p.qrToken}`;
          const qr = await QRCode.toDataURL(url);
          return { ...p, qr };
        }
        return { ...p, qr: null };
      })
    );

    res.json({ passes: enhanced });
  } catch (err) {
    console.error('Status fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


export async function getAssignedMentor(req: Request, res: Response): Promise<any> {
  const user = (req as any).user;

  try {
    const mapping = await prisma.studentMentor.findFirst({
      where: {
        student: {
          email: user.email.toLowerCase(),
        },
      },
      include: {
        mentor: true,
      },
    });

    if (!mapping) {
      return res.status(404).json({ error: 'No mentor assigned' });
    }

    const mentor = mapping.mentor;
    res.json({
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
      },
    });
  } catch (err) {
    console.error('Mentor fetch error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
