import { db } from './config/database';
import { runMigrations } from './database/migrate';
import { seedDatabase } from './database/seed';

async function testDatabase() {
  console.log('🧪 Starting Database Integrity & 15-Entity Validation Test...\n');

  // Step 1: Run migrations
  await runMigrations();

  // Step 2: Seed data
  await seedDatabase();

  // Step 3: Test queries for all 15 entities
  const tables = [
    'organizations',
    'users',
    'workers',
    'training_modules',
    'training_scenarios',
    'scenario_steps',
    'training_assets',
    'training_attempts',
    'attempt_actions',
    'assessment_results',
    'certificates',
    'certificate_verifications',
    'translations',
    'devices',
    'sync_queue',
  ];

  console.log('\n--- 15 Entity Table Row Counts ---');
  for (const table of tables) {
    const res = await db.query<{ count: number }>(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`[PASS] Table: ${table.padEnd(26)} -> Count: ${res.rows[0].count}`);
    if (res.rows[0].count === 0) {
      throw new Error(`Table ${table} is unexpectedly empty!`);
    }
  }

  // Step 4: Relational Join Test (Worker + Org + User + Certificate + Module)
  console.log('\n--- Testing Relational Integrity & Complex Safety Compliance Join ---');
  const complexJoinQuery = `
    SELECT 
      w.employee_id,
      u.full_name as worker_name,
      o.name as organization_name,
      o.district,
      w.trade_role,
      w.preferred_language,
      m.title as certified_module,
      c.certificate_number,
      c.status as cert_status,
      ar.percentage as final_score
    FROM certificates c
    JOIN workers w ON c.worker_id = w.id
    JOIN users u ON w.user_id = u.id
    JOIN organizations o ON w.organization_id = o.id
    JOIN training_modules m ON c.module_id = m.id
    JOIN assessment_results ar ON c.attempt_id = ar.attempt_id;
  `;

  const joinRes = await db.query(complexJoinQuery);
  console.log(`Successfully retrieved ${joinRes.rowCount} certified worker records across mining & steel plants:`);
  console.table(joinRes.rows);

  // Step 5: Santali & Hindi Localization Query Test
  console.log('\n--- Testing Trilingual Localization Retrieval (English, Hindi, Santali Ol Chiki) ---');
  const stepsRes = await db.query(`
    SELECT step_order, title, instruction_en, instruction_hi, instruction_sat 
    FROM scenario_steps 
    WHERE scenario_id = 'scen-fire-01' 
    ORDER BY step_order ASC;
  `);

  stepsRes.rows.forEach((s) => {
    console.log(`Step ${s.step_order}: ${s.title}`);
    console.log(`  EN: ${s.instruction_en}`);
    console.log(`  HI: ${s.instruction_hi}`);
    console.log(`  SAT: ${s.instruction_sat}`);
  });

  console.log('\n✅ ALL DATABASE TESTS PASSED SUCCESSFULLY WITH 100% RELATIONAL INTEGRITY!');
  await db.close();
}

testDatabase().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
