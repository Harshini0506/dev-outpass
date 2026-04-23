import { Router } from 'express';
import { requireRole, verifyTokenWithAuthServer } from '../middlewares/role.middleware';
import { uploadExcel } from '../middlewares/upload.middleware';
import * as adminController from '../controllers/admin.controller';
import { Request, Response, NextFunction } from 'express';

const router = Router();

/**
 * Helper function to extract userToken from cookies
 */
function extractUserToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const userTokenCookie = cookies.find(cookie => cookie.startsWith('userToken='));
  
  if (userTokenCookie) {
    return userTokenCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Middleware to require authentication (but not a specific role)
 */
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const cookieHeader = req.headers.cookie;
  const token = extractUserToken(cookieHeader);
  
  if (!token) {
    console.log('❌ No token found, rejecting request');
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  verifyTokenWithAuthServer(token)
    .then(result => {
      if (!result.valid || !result.user) {
        console.log('❌ Invalid token or no user data');
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      (req as any).user = result.user;
      next();
    })
    .catch(error => {
      console.error('❌ Auth server verification failed:', error.message);
      res.status(401).json({ error: 'User not authenticated' });
    });
}

/**
 * GET /api/admin/users
 * Get all users in the system (HOD only)
 */
router.get('/users', requireRole('HOD'), adminController.getAllUsers);

/**
 * PUT /api/admin/users/:userId/role
 * Update a user's role (HOD only)
 */
router.put('/users/:userId/role', requireRole('HOD'), adminController.updateUserRole);

/**
 * PUT /api/admin/users/:userId/mobile
 * Update a user's mobile numbers (HOD only)
 */
router.put('/users/:userId/mobile', requireRole('HOD'), adminController.updateUserMobile);

/**
 * GET /api/admin/users/:userId/dependencies
 * Get user dependencies for deletion confirmation (HOD only)
 */
router.get('/users/:userId/dependencies', requireRole('HOD'), adminController.getUserDependencies);

/**
 * DELETE /api/admin/users/:userId
 * Delete a user from the system (HOD only)
 */
router.delete('/users/:userId', requireRole('HOD'), adminController.deleteUser);

/**
 * POST /api/admin/users
 * Create a new user manually (HOD only)
 */
router.post('/users', requireRole('HOD'), adminController.createUser);

/**
 * POST /api/admin/bulk-add-users
 * Bulk add students and mentors from Excel file (HOD only)
 */
router.post('/bulk-add-users', requireRole('HOD'), uploadExcel, adminController.bulkAddUsers);

/**
 * POST /api/admin/undo-bulk-imports (Development only)
 * Undo recent bulk imported users while preserving existing users
 */
router.post('/undo-bulk-imports', requireRole('HOD'), adminController.undoBulkImports);

/**
 * GET /api/admin/bulk-imports
 * Get list of past bulk uploads (HOD only)
 */
router.get('/bulk-imports', requireRole('HOD'), adminController.getBulkImports);

/**
 * DELETE /api/admin/bulk-imports/:id
 * Delete a specific bulk upload history item and its users (HOD only)
 */
router.delete('/bulk-imports/:id', requireRole('HOD'), adminController.deleteBulkImport);

/**
 * GET /api/admin/pending-actions
 * Get pending actions that require admin attention (HOD only)
 */
router.get('/pending-actions', requireRole('HOD'), adminController.getPendingActions);

/**
 * POST /api/admin/bulk-assign-mentors
 * Bulk assign mentors to students without mentors (HOD only)
 */
router.post('/bulk-assign-mentors', requireRole('HOD'), adminController.bulkAssignMentors);

/**
 * POST /api/admin/process-no-mentor-alerts
 * Process students with "No mentor" assignments (HOD only)
 */
router.post('/process-no-mentor-alerts', requireRole('HOD'), adminController.processNoMentorAlerts);

/**
 * GET /api/admin/stats
 * Get system statistics (HOD only)
 */
router.get('/stats', requireRole('HOD'), adminController.getSystemStats);

/**
 * POST /api/admin/upload-excel
 * Upload Excel file to create student-mentor mappings
 */
router.post('/upload-excel', requireRole('HOD'), uploadExcel, adminController.uploadExcelFile);

/**
 * GET /api/admin/student-mentor-mappings
 * Get all student-mentor mappings
 */
router.get('/student-mentor-mappings', requireRole('HOD'), adminController.getStudentMentorMappings);

/**
 * GET /api/admin/unmapped-students
 * Get all students without mentor assignments
 */
router.get('/unmapped-students', requireRole('HOD'), adminController.getUnmappedStudents);

/**
 * PUT /api/admin/student-mentor-mappings/:studentId
 * Update or create student-mentor mapping
 */
router.put('/student-mentor-mappings/:studentId', requireRole('HOD'), adminController.updateStudentMentorMapping);

/**
 * GET /api/admin/outpass-reports
 * Get comprehensive outpass reports with filtering options (HOD only)
 */
router.get('/outpass-reports', requireRole('HOD'), adminController.getOutpassReports);

/**
 * GET /api/admin/live-outpass-status
 * Get real-time status of students currently outside campus (HOD only)
 */
router.get('/live-outpass-status', requireRole('HOD'), adminController.getLiveOutpassStatus);

/**
 * POST /api/admin/download-outpass-report
 * Generate and download Excel report of outpass data (HOD only)
 */
router.post('/download-outpass-report', requireRole('HOD'), adminController.downloadOutpassReport);

/**
 * POST /api/admin/download-approved-scanned-report
 * Generate and download Excel report of only approved and scanned outpass data (HOD only)
 */
router.post('/download-approved-scanned-report', requireRole('HOD'), adminController.downloadApprovedScannedReport);

/**
 * POST /api/admin/export-event-logs
 * Export event logs for outpass activities (HOD only)
 */
router.post('/export-event-logs', requireRole('HOD'), adminController.exportEventLogs);

/**
 * POST /api/admin/role-request
 * Create a role request notification (any authenticated user)
 */
router.post('/role-request', requireAuth, adminController.createRoleRequest);

/**
 * GET /api/admin/notifications
 * Get all pending notifications (HOD only)
 */
router.get('/notifications', requireRole('HOD'), adminController.getNotifications);

/**
 * PUT /api/admin/notifications/:id/resolve
 * Resolve a notification and optionally assign role (HOD only)
 */
router.put('/notifications/:id/resolve', requireRole('HOD'), adminController.resolveNotification);

export default router;
