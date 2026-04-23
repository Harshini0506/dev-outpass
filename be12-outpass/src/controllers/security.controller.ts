import { RequestHandler } from 'express';
import { prisma } from '../prisma/client';
import { smsService } from '../utils/sms.util';

export const scanQRCode: RequestHandler = async (req, res) => {
  const { passId, token } = req.params;

  if (!token || !passId) {
    res.status(400).json({ message: 'Token and Pass ID required' });
    return;
  }

  try {
    const pass = await prisma.gatePass.findFirst({
      where: { qrToken: token },
      include: { student: { select: { name: true, email: true } } },
    });

    if (!pass || pass.status !== 'APPROVED' || !pass.qrValid) {
      res.status(401).json({ message: 'Invalid or expired QR code' });
      return;
    }

    if (pass.scannedAt) {
      res.status(410).json({ message: 'QR already used' });
      return;
    }

    const updated = await prisma.gatePass.update({
      where: { id: pass.id },
      data: {
        qrValid: false,
        status: 'UTILIZED',
        scannedAt: new Date(),
      },
    });

    // Send SMS notification to parent when QR is scanned
    try {
      console.log('🔍 Fetching complete student data for SMS...');
      
      const student = await prisma.user.findUnique({
        where: { email: pass.student.email.toLowerCase() }
      });
      
      console.log('Student data fetched:', student);
      
      if (student?.name) {
        const parentMobile = (student as any)?.parentMobile || '';
        console.log('Parent mobile extracted:', parentMobile);
        
        if (parentMobile) {
          console.log('📱 Attempting to send QR scan SMS to parent...');
          // Extract roll number from email (assuming format: rollno@domain.com)
          const rollno = student.email.split('@')[0];
          await smsService.sendQRScannedToParent(
            student.name,
            rollno,
            pass.reason,
            parentMobile,
            updated.scannedAt || new Date()
          );
        } else {
          console.log('⚠️ No parent mobile number found for student:', student.name);
        }
      }
    } catch (smsError) {
      console.error('SMS notification error:', smsError);
      // Don't fail the request if SMS fails
    }

    res.status(200).json({
      id: pass.id,
      reason: pass.reason,
      status: 'UTILIZED',
      scannedAt: updated.scannedAt?.toISOString() ?? null,
      student: pass.student,
      appliedAt: pass.appliedAt,
      message: 'Scan accepted — access granted.',
    });
  } catch (err) {
    console.error('QR Scan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
