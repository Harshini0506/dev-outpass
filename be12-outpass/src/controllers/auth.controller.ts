import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../prisma/client';

// Create axios instance for auth server communication
const authServerApi = axios.create({
  baseURL: process.env.AUTH_SERVER_URL || 'http://localhost:2999',
  withCredentials: true,
  timeout: 5000,
});

/**
 * Register/sync user with main API after auth server authentication
 * This endpoint is called by the frontend after successful auth server login
 */
export async function registerUser(req: Request, res: Response): Promise<any> {
  try {
    // Get user info from auth server using forwarded cookies
    const cookieHeader = req.headers.cookie;
    
    const authResponse = await authServerApi.get('/check-auth', {
      headers: {
        cookie: cookieHeader || ''
      }
    });

    if (!authResponse.data.logged_in || !authResponse.data.user) {
      return res.status(401).json({ error: 'Not authenticated with auth server' });
    }

    const authUser = authResponse.data.user;
    const email = authUser.email?.toLowerCase();
    const name = authUser.name || 'Unknown';

    if (!email) {
      return res.status(400).json({ error: 'Invalid user data (no email)' });
    }

    // Check if user exists in our local database
    let user = await prisma.user.findUnique({ where: { email } });

    if (user && (!user.role || user.role === 'PENDING')) {
      // Auto-assign STUDENT role locally if it's missing or pending
      console.log('🔄 Auto-assigning STUDENT role to existing user:', email);
      user = await prisma.user.update({
        where: { email },
        data: { role: 'STUDENT' }
      });
    } else if (!user) {
      // Allow all @vnrvjiet.in emails to register
      const vnrEmailRegex = /^[a-zA-Z0-9._%+-]+@vnrvjiet\.in$/i;
      
      if (!vnrEmailRegex.test(email)) {
        return res.status(403).json({ 
          error: 'Access denied. Only VNR VJIET email addresses are allowed.' 
        });
      }

      // Create new user with STUDENT role
      user = await prisma.user.create({ 
        data: { 
          email, 
          name,
          role: 'STUDENT' 
        } 
      });
      
      console.log('✅ New student registered:', { email, name });
    }

    res.json({ 
      message: 'User registered/synced successfully', 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('User registration error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

/**
 * Check authentication status and return user info
 * This combines auth server authentication with local user data
 */
export async function checkAuth(req: Request, res: Response): Promise<any> {
  try {
    const cookieHeader = req.headers.cookie;
    
    // Check with auth server first
    const authResponse = await authServerApi.get('/check-auth', {
      headers: {
        cookie: cookieHeader || ''
      }
    });

    if (!authResponse.data.logged_in || !authResponse.data.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const authUser = authResponse.data.user;
    
    // Get local user data for role information
    const user = await prisma.user.findUnique({ 
      where: { email: authUser.email?.toLowerCase() } 
    });

    if (user) {
      // For local testing: if role is PENDING, show as STUDENT
      const effectiveRole = user.role === 'PENDING' ? 'STUDENT' : user.role;
      
      // Return combined auth server + local data
      res.json({ 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
          // Include auth server data
          picture: authUser.picture,
          family_name: authUser.family_name
        }
      });
    } else {
      // User authenticated but not in local system
      res.json({ 
        user: {
          email: authUser.email,
          name: authUser.name,
          picture: authUser.picture,
          family_name: authUser.family_name
          // No role - user needs to be registered
        }
      });
    }
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Authentication check failed' });
  }
}

/**
 * Logout endpoint - clears any local session data
 * Auth server logout is handled separately
 */
export function logout(req: Request, res: Response) {
  // Since we're not managing cookies locally anymore,
  // just return success - auth server handles the actual logout
  res.json({ message: 'Logout successful' });
}
