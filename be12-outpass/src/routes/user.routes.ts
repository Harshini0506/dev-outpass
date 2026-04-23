import { Router } from 'express';
import { prisma } from '../prisma/client';
import { optionalAuth } from '../middlewares/role.middleware';

const router = Router();

/**
 * GET /api/user/profile
 * Get user profile including role from the database
 * This endpoint is called by the frontend after authentication with the auth server
 */
router.get('/profile', optionalAuth, async (req, res) => {
  try {
    console.log('🔍 Fetching user profile...');
    
    // Extract user from middleware (if authenticated)
    const authenticatedUser = (req as any).user;
    
    if (!authenticatedUser) {
      console.log('❌ No authenticated user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('👤 Authenticated user:', authenticatedUser.email);

    // Fetch user details from database
    const user = await prisma.user.findUnique({
      where: { email: authenticatedUser.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database:', authenticatedUser.email);
      return res.status(404).json({ error: 'User not found in system' });
    }

    console.log('✅ User profile fetched:', { email: user.email, role: user.role });

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
