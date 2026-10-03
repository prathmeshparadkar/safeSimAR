import { Request, Response } from 'express';
import { CertificateService } from '../services/certificate.service';
import { sendSuccess, sendError } from '../utils/response';

export class CertificateController {
  static async listCertificates(_req: Request, res: Response) {
    try {
      const certs = await CertificateService.listCertificates();
      return sendSuccess(res, certs, 'Certificates retrieved');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async verifyCertificate(req: Request, res: Response) {
    try {
      const certNumber = (req.body.certificate_number || req.query.certNumber || req.params.certNumber) as string;
      if (!certNumber) {
        return sendError(res, 'Certificate number is required', 400);
      }
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await CertificateService.verifyCertificate(certNumber, clientIp);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
