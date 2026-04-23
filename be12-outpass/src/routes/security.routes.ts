import { Router } from 'express';
import { scanQRCode } from '../controllers/security.controller';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// Test route for security scanning
router.post('/scan-test', (req, res) => {
  console.log('Scan test hit!');
  res.json({ message: 'Scan test route works!' });
});

// QR code scanning route
router.get('/scan/:passId/:token', requireRole('SECURITY'), scanQRCode);

export default router;
