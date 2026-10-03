import { Request } from 'express';

export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TRAINER' | 'WORKER';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId?: string | null;
  workerId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}
