import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';

const router = Router();

// GET /api/v1/certificates
router.get('/', CertificateController.listCertificates);

// POST /api/v1/certificates/verify
router.post('/verify', CertificateController.verifyCertificate);

// GET /api/v1/certificates/verify/:certNumber
router.get('/verify/:certNumber', CertificateController.verifyCertificate);

export default router;
