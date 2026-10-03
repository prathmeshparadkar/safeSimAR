import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';

export interface ActionItemDto {
  stepId: string;
  actionType: string;
  objectInteracted: string;
  isCorrect: boolean;
  reactionTimeMs: number;
  penaltyApplied?: number;
  telemetryJson?: string;
  timestamp?: string;
}

export interface CreateAttemptDto {
  workerId: string;
  scenarioId: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  score: number;
  passed: boolean;
  isOffline?: boolean;
  deviceFingerprint?: string;
  deviceModel?: string;
  actions: ActionItemDto[];
}

export class AttemptService {
  static async recordAttempt(dto: CreateAttemptDto) {
    const attemptId = uuidv4();
    const nowIso = new Date().toISOString();
    const duration = dto.durationSeconds || 120;
    const isOffline = dto.isOffline ? 1 : 0;
    const passed = dto.passed ? 1 : 0;

    // 1. Verify worker & scenario exist
    const workerRes = await db.query(
      `SELECT w.id, w.user_id, w.organization_id, w.employee_id, u.full_name, o.code as org_code
       FROM workers w
       JOIN users u ON w.user_id = u.id
       JOIN organizations o ON w.organization_id = o.id
       WHERE w.id = $1 OR w.employee_id = $1`,
      [dto.workerId]
    );

    if (workerRes.rowCount === 0) {
      throw new Error(`Worker with ID or Employee ID '${dto.workerId}' not found.`);
    }

    const worker = workerRes.rows[0];

    const scenarioRes = await db.query(
      `SELECT s.id, s.module_id, s.title, s.passing_score, m.code as module_code, m.title as module_title
       FROM training_scenarios s
       JOIN training_modules m ON s.module_id = m.id
       WHERE s.id = $1`,
      [dto.scenarioId]
    );

    if (scenarioRes.rowCount === 0) {
      throw new Error(`Scenario with ID '${dto.scenarioId}' not found.`);
    }

    const scenario = scenarioRes.rows[0];

    // Determine attempt count
    const attemptCountRes = await db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM training_attempts WHERE worker_id = $1 AND scenario_id = $2`,
      [worker.id, scenario.id]
    );
    const attemptNumber = (attemptCountRes.rows[0]?.count || 0) + 1;

    // 2. Insert Device if provided
    if (dto.deviceFingerprint) {
      const devId = `dev-${crypto.createHash('md5').update(dto.deviceFingerprint).digest('hex').slice(0, 8)}`;
      await db.query(
        `INSERT OR IGNORE INTO devices (id, worker_id, device_fingerprint, device_model, os_version, ar_core_supported, app_version, last_sync_time)
         VALUES ($1, $2, $3, $4, 'Android 14', 1, '1.2.0', datetime('now'))`,
        [devId, worker.id, dto.deviceFingerprint, dto.deviceModel || 'ARCore Android Device']
      );
    }

    // 3. Insert training_attempts
    await db.query(
      `INSERT INTO training_attempts (id, worker_id, scenario_id, attempt_number, start_time, end_time, duration_seconds, is_offline, sync_status, score, passed, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SYNCED', $9, $10, datetime('now'), datetime('now'))`,
      [
        attemptId,
        worker.id,
        scenario.id,
        attemptNumber,
        dto.startTime || nowIso,
        dto.endTime || nowIso,
        duration,
        isOffline,
        dto.score,
        passed,
      ]
    );

    // 4. Insert attempt_actions
    for (const action of dto.actions) {
      const actionId = uuidv4();
      let validStepId: string | null = null;
      if (action.stepId) {
        const stepCheck = await db.query(`SELECT id FROM scenario_steps WHERE id = $1`, [action.stepId]);
        if (stepCheck.rowCount > 0) {
          validStepId = action.stepId;
        }
      }

      await db.query(
        `INSERT INTO attempt_actions (id, attempt_id, step_id, action_timestamp, action_type, object_interacted, is_correct, reaction_time_ms, penalty_applied, telemetry_json, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, datetime('now'))`,
        [
          actionId,
          attemptId,
          validStepId,
          action.timestamp || nowIso,
          action.actionType,
          action.objectInteracted,
          action.isCorrect ? 1 : 0,
          action.reactionTimeMs || 5000,
          action.penaltyApplied || 0,
          action.telemetryJson || null,
        ]
      );
    }

    // 5. Compute assessment results
    const assessmentId = uuidv4();
    const mistakesCount = dto.actions.filter((a) => !a.isCorrect).length;
    const protocolAccuracy = dto.actions.length > 0
      ? Math.round(((dto.actions.length - mistakesCount) / dto.actions.length) * 1000) / 10
      : 100;
    const speedScore = Math.max(50, Math.min(100, Math.round(100 - (duration / 2))));

    const evalSummary = passed
      ? `Successfully executed ${scenario.title} within safety regulations. Zero critical safety violations.`
      : `Failed competency threshold for ${scenario.title}. Recorded ${mistakesCount} safety violation(s). Remediation required.`;

    await db.query(
      `INSERT INTO assessment_results (id, attempt_id, worker_id, total_score, max_possible_score, percentage, evaluation_summary, hazard_awareness_score, reaction_speed_score, protocol_accuracy_score, passed, evaluated_at)
       VALUES ($1, $2, $3, $4, 100.0, $5, $6, $7, $8, $9, $10, datetime('now'))`,
      [
        assessmentId,
        attemptId,
        worker.id,
        dto.score,
        dto.score,
        evalSummary,
        Math.min(100, dto.score + 5),
        speedScore,
        protocolAccuracy,
        passed,
      ]
    );

    // 6. If passed, auto-issue or renew Certificate
    let issuedCertificate = null;
    if (passed && dto.score >= scenario.passing_score) {
      // Check if active cert already exists
      const existingCert = await db.query(
        `SELECT id, certificate_number FROM certificates WHERE worker_id = $1 AND module_id = $2 AND status = 'ACTIVE'`,
        [worker.id, scenario.module_id]
      );

      const certNumber = existingCert.rowCount > 0
        ? existingCert.rows[0].certificate_number
        : `JH-${worker.org_code?.split('-')[0] || 'MIN'}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      const issueDate = nowIso.slice(0, 10);
      const expiryDate = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // 2 years

      const qrPayload = JSON.stringify({
        certNo: certNumber,
        worker: worker.full_name,
        empId: worker.employee_id,
        module: scenario.module_title,
        score: `${dto.score}%`,
        issued: issueDate,
      });

      const digitalSignature = `SHA256:${crypto.createHash('sha256').update(qrPayload + 'JH_GOV_DGMS_SECRET').digest('hex')}`;

      if (existingCert.rowCount === 0) {
        const certId = uuidv4();
        await db.query(
          `INSERT INTO certificates (id, certificate_number, worker_id, module_id, attempt_id, issue_date, expiry_date, qr_code_data, digital_signature, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ACTIVE', datetime('now'), datetime('now'))`,
          [certId, certNumber, worker.id, scenario.module_id, attemptId, issueDate, expiryDate, qrPayload, digitalSignature]
        );
        issuedCertificate = { certNumber, issueDate, expiryDate, digitalSignature };
      }

      // Update worker completed trainings count
      await db.query(
        `UPDATE workers SET total_trainings_completed = total_trainings_completed + 1 WHERE id = $1`,
        [worker.id]
      );
    }

    return {
      attemptId,
      workerId: worker.id,
      workerName: worker.full_name,
      scenarioId: scenario.id,
      score: dto.score,
      passed: Boolean(passed),
      attemptNumber,
      certificate: issuedCertificate,
    };
  }

  static async listAttempts(limit = 20) {
    const res = await db.query(
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
        w.id as worker_id,
        w.employee_id,
        u.full_name as worker_name,
        s.id as scenario_id,
        s.title as scenario_title,
        m.code as module_code,
        m.title as module_title
      FROM training_attempts a
      JOIN workers w ON a.worker_id = w.id
      JOIN users u ON w.user_id = u.id
      JOIN training_scenarios s ON a.scenario_id = s.id
      JOIN training_modules m ON s.module_id = m.id
      ORDER BY a.start_time DESC
      LIMIT $1
      `,
      [limit]
    );
    return res.rows;
  }
}
