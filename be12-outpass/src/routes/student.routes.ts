import { Router } from 'express';
import { applyGatePass, getStudentStatus ,getAssignedMentor } from '../controllers/student.controller';
import { requireRole } from '../middlewares/role.middleware';

export const studentRoutes = Router();

studentRoutes.post('/apply', requireRole('STUDENT'), applyGatePass);
studentRoutes.get('/status', requireRole('STUDENT'), getStudentStatus);
studentRoutes.get('/mentor', requireRole('STUDENT'), getAssignedMentor);