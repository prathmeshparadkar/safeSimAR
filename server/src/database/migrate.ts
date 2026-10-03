import { db } from '../config/database';
import { SCHEMA_SQL } from './schema';

export async function runMigrations() {
  console.log('🚀 Running database migrations...');
  try {
    await db.exec(SCHEMA_SQL);
    console.log('✅ Base schema executed successfully.');

    // Verify all 15 tables exist
    const checkQuery = `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' 
      ORDER BY name ASC;
    `;
    const result = await db.query<{ name: string }>(checkQuery);
    const existingTables = result.rows.map((r) => r.name);

    console.log(`📊 Total tables in database: ${existingTables.length}`);
    existingTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });

    const expectedTables = [
      'assessment_results',
      'attempt_actions',
      'certificate_verifications',
      'certificates',
      'devices',
      'organizations',
      'scenario_steps',
      'sync_queue',
      'training_assets',
      'training_attempts',
      'training_modules',
      'training_scenarios',
      'translations',
      'users',
      'workers',
    ];

    const missingTables = expectedTables.filter((t) => !existingTables.includes(t));
    if (missingTables.length > 0) {
      throw new Error(`Missing expected tables: ${missingTables.join(', ')}`);
    }

    console.log('🎉 All 15 required core entities verified successfully!');
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}
