import { db } from '../config/database';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { UserRole } from '../types';

export class AuthService {
  static async login(email: string, plainTextPassword: string) {
    const userResult = await db.query(
      `SELECT u.id, u.organization_id, u.email, u.password_hash, u.full_name, u.role, u.is_active,
              w.id as worker_id, w.employee_id, w.preferred_language, o.name as org_name
       FROM users u
       LEFT JOIN workers w ON u.id = w.user_id
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (userResult.rowCount === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new Error('User account is deactivated. Contact site administrator.');
    }

    const isMatch = await comparePassword(plainTextPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organization_id,
      workerId: user.worker_id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.org_name,
        workerId: user.worker_id,
        employeeId: user.employee_id,
        preferredLanguage: user.preferred_language || 'hi',
      },
    };
  }

  static async getProfile(userId: string) {
    const res = await db.query(
      `SELECT u.id, u.organization_id, u.email, u.full_name, u.role, u.phone, u.created_at,
              w.id as worker_id, w.employee_id, w.trade_role, w.shift, w.current_safety_level,
              w.total_trainings_completed, w.preferred_language, o.name as org_name, o.district
       FROM users u
       LEFT JOIN workers w ON u.id = w.user_id
       LEFT JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [userId]
    );

    if (res.rowCount === 0) {
      throw new Error('User profile not found');
    }

    return res.rows[0];
  }
}
