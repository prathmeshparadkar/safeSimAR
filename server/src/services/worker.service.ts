import { db } from '../config/database';

export interface WorkerFilterOptions {
  search?: string;
  status?: string;
  orgId?: string;
  page?: number;
  limit?: number;
}

export class WorkerService {
  static async listWorkers(options: WorkerFilterOptions = {}) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (options.orgId) {
      params.push(options.orgId);
      whereClause += ` AND w.organization_id = $${params.length}`;
    }

    if (options.search) {
      params.push(`%${options.search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(u.full_name) LIKE $${params.length} OR LOWER(w.employee_id) LIKE $${params.length} OR LOWER(w.trade_role) LIKE $${params.length})`;
    }

    // Total count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM workers w
      JOIN users u ON w.user_id = u.id
      ${whereClause}
    `;
    const countRes = await db.query<{ total: number }>(countSql, params);
    const total = countRes.rows[0]?.total || 0;

    // Data query with latest score, training status, and certificate status
    const dataSql = `
      SELECT 
        w.id,
        w.employee_id,
        w.trade_role as department,
        w.shift,
        w.current_safety_level,
        w.total_trainings_completed,
        w.preferred_language,
        w.is_active,
        u.id as user_id,
        u.full_name as name,
        u.email,
        u.phone,
        o.id as organization_id,
        o.name as organization_name,
        o.district,
        -- Latest attempt score
        (
          SELECT a.score 
          FROM training_attempts a 
          WHERE a.worker_id = w.id 
          ORDER BY a.start_time DESC 
          LIMIT 1
        ) as latest_score,
        -- Training status: COMPLETED if passed an attempt, else PENDING
        CASE 
          WHEN EXISTS (SELECT 1 FROM training_attempts a WHERE a.worker_id = w.id AND a.passed = 1) THEN 'COMPLETED'
          WHEN EXISTS (SELECT 1 FROM training_attempts a WHERE a.worker_id = w.id) THEN 'IN_PROGRESS'
          ELSE 'PENDING'
        END as training_status,
        -- Certificate status
        COALESCE(
          (SELECT c.status FROM certificates c WHERE c.worker_id = w.id ORDER BY c.issue_date DESC LIMIT 1),
          'NONE'
        ) as certificate_status
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN organizations o ON w.organization_id = o.id
      ${whereClause}
      ORDER BY w.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const dataRes = await db.query(dataSql, params);

    return {
      workers: dataRes.rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getWorkerDetail(workerId: string) {
    // 1. Profile
    const profileRes = await db.query(
      `
      SELECT 
        w.id,
        w.employee_id,
        w.trade_role as department,
        w.shift,
        w.current_safety_level,
        w.total_trainings_completed,
        w.preferred_language,
        w.emergency_contact,
        w.is_active,
        w.created_at,
        u.full_name as name,
        u.email,
        u.phone,
        u.role,
        o.id as organization_id,
        o.name as organization_name,
        o.district,
        o.type as industry_type
      FROM workers w
      JOIN users u ON w.user_id = u.id
      JOIN organizations o ON w.organization_id = o.id
      WHERE w.id = $1
      `,
      [workerId]
    );

    if (profileRes.rowCount === 0) {
      throw new Error(`Worker not found: ${workerId}`);
    }

    const profile = profileRes.rows[0];

    // 2. Training Attempts & Scores
    const attemptsRes = await db.query(
      `
      SELECT 
        a.id,
        a.attempt_number,
        a.start_time,
        a.end_time,
        a.duration_seconds,
        a.is_offline,
        a.sync_status,
        a.score,
        a.passed,
        s.title as scenario_title,
        s.hazard_level,
        m.title as module_title,
        m.code as module_code
      FROM training_attempts a
      JOIN training_scenarios s ON a.scenario_id = s.id
      JOIN training_modules m ON s.module_id = m.id
      WHERE a.worker_id = $1
      ORDER BY a.start_time DESC
      `,
      [workerId]
    );

    // 3. Certificates
    const certsRes = await db.query(
      `
      SELECT 
        c.id,
        c.certificate_number,
        c.issue_date,
        c.expiry_date,
        c.status,
        c.digital_signature,
        m.title as module_title,
        m.code as module_code
      FROM certificates c
      JOIN training_modules m ON c.module_id = m.id
      WHERE c.worker_id = $1
      ORDER BY c.issue_date DESC
      `,
      [workerId]
    );

    // 4. Common Mistakes & Penalties Telemetry
    const mistakesRes = await db.query(
      `
      SELECT 
        ac.id,
        ac.action_timestamp,
        ac.action_type,
        ac.object_interacted,
        ac.is_correct,
        ac.reaction_time_ms,
        ac.penalty_applied,
        ac.telemetry_json,
        st.title as step_title
      FROM attempt_actions ac
      JOIN training_attempts a ON ac.attempt_id = a.id
      LEFT JOIN scenario_steps st ON ac.step_id = st.id
      WHERE a.worker_id = $1 AND (ac.penalty_applied > 0 OR ac.is_correct = 0)
      ORDER BY ac.action_timestamp DESC
      `,
      [workerId]
    );

    return {
      profile,
      attempts: attemptsRes.rows,
      certificates: certsRes.rows,
      mistakes: mistakesRes.rows.map((m) => {
        let details = null;
        try {
          details = m.telemetry_json ? JSON.parse(m.telemetry_json) : null;
        } catch {
          // ignore json parse error
        }
        return {
          ...m,
          details,
        };
      }),
    };
  }
}
