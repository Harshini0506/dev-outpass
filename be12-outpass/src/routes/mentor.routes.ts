import { Router } from 'express'
import { getMentorRequests, respondToRequest } from '../controllers/mentor.controller'
import { requireRole } from '../middlewares/role.middleware'

export const mentorRoutes = Router()

mentorRoutes.get('/requests', requireRole('MENTOR'), getMentorRequests)
mentorRoutes.post('/respond', requireRole('MENTOR'), respondToRequest)
