import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER', 'WORKER']),
  organizationId: z.string().optional(),
  phone: z.string().optional(),
});
