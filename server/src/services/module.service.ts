import { db } from '../config/database';

export class ModuleService {
  static async listModules() {
    const res = await db.query(`
      SELECT m.*, 
        (SELECT COUNT(*) FROM training_scenarios s WHERE s.module_id = m.id) as scenario_count
      FROM training_modules m
      WHERE m.is_active = 1
      ORDER BY m.code ASC
    `);
    return res.rows;
  }

  static async getModuleDetails(moduleId: string) {
    const modRes = await db.query(
      `SELECT * FROM training_modules WHERE id = $1`,
      [moduleId]
    );

    if (modRes.rowCount === 0) {
      throw new Error(`Training module not found: ${moduleId}`);
    }

    const scenariosRes = await db.query(
      `SELECT * FROM training_scenarios WHERE module_id = $1 ORDER BY scenario_number ASC`,
      [moduleId]
    );

    const scenariosWithSteps = await Promise.all(
      scenariosRes.rows.map(async (scen) => {
        const stepsRes = await db.query(
          `SELECT * FROM scenario_steps WHERE scenario_id = $1 ORDER BY step_order ASC`,
          [scen.id]
        );
        return {
          ...scen,
          steps: stepsRes.rows,
        };
      })
    );

    return {
      ...modRes.rows[0],
      scenarios: scenariosWithSteps,
    };
  }
}
