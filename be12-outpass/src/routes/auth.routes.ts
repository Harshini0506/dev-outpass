import { Router } from 'express';
import { registerUser, checkAuth, logout } from '../controllers/auth.controller';

export const authRoutes = Router();

// Register/sync user after auth server login
authRoutes.post('/register', registerUser);

// Check authentication status (combines auth server + local user data)
authRoutes.get('/check-auth', checkAuth);

// Logout (local cleanup - auth server logout handled separately)
authRoutes.post('/logout', logout);

// Legacy endpoint for backward compatibility (maps to register)
authRoutes.post('/google', registerUser);
