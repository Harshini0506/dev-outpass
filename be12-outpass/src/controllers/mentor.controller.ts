import { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import { generateQRCode, generateToken } from '../utils/qr.util'
import { GatePassStatus } from '@prisma/client' // ✅ enum import
import { smsService } from '../utils/sms.util'

export async function getMentorRequests(req: Request, res: Response) {
  const mentor = (req as any).user

  try {
    // If no user is authenticated, return empty requests (development fallback)
    if (!mentor) {
      console.log('⚠️ No authenticated user found - returning empty requests');
      return res.json({ 
        requests: [],
        message: 'No authenticated user - please login to see requests'
      });
    }

    const requests = await prisma.gatePass.findMany({
      where: { mentorId: mentor.id, status: GatePassStatus.PENDING },
      include: {
        student: {
          select: { name: true, email: true }
        }
      },
      orderBy: { appliedAt: 'desc' }
    })

    res.json({ requests })
  } catch (err) {
    console.error('Mentor requests error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function respondToRequest(req: Request, res: Response): Promise<any> {
  const mentor = (req as any).user
  const { gatePassId, action } = req.body
  console.log('Received respondToRequest request:', req.body);

  // Check for authenticated user
  if (!mentor) {
    console.log('⚠️ No authenticated user found - authentication required for this operation');
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please login to respond to requests'
    });
  }

  if (!gatePassId || !['APPROVE', 'REJECT'].includes(action)) {
    return res.status(400).json({ error: 'Invalid request body' })
  }

  try {
    const pass = await prisma.gatePass.findUnique({ where: { id: gatePassId } })

    if (!pass || pass.mentorId !== mentor.id) {
      return res.status(404).json({ error: 'Unauthorized or not found' })
    }

    let qr: string | null = null
    let token: string | null = null
    let valid = false

    if (action === 'APPROVE') {
      token = generateToken()
      qr = await generateQRCode(gatePassId, token)
      valid = true
    }
    const statusMap = {
  APPROVE: GatePassStatus.APPROVED,
  REJECT: GatePassStatus.REJECTED
}


    const updated = await prisma.gatePass.update({
      where: { id: gatePassId },
      data: {
        status: statusMap[action], // ✅ safe enum cast
        updatedAt: new Date(),
        qrToken: token,
        qrValid: valid,
        qrGeneratedAt: valid ? new Date() : null,

      }
    })

    // Send SMS notifications for approval/rejection
    try {
      const gatePassWithDetails = await prisma.gatePass.findUnique({
        where: { id: gatePassId },
        include: {
          student: true
        }
      });

      // SMS notifications for approval/rejection are not implemented
      // Only mentor notification (on application) and parent QR scan notification are available
      console.log(`✅ Gate pass ${action.toLowerCase()}d for student: ${gatePassWithDetails?.student?.name || 'Unknown'}`);

    } catch (error) {
      console.error('Action processing error:', error);
      // Don't fail the request if there's an error
    }

    res.json({ message: `Gate pass ${action.toLowerCase()}d`, gatePass: updated, qr })
  } catch (err) {
    console.error('Mentor response error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
