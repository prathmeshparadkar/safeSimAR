import bcrypt from 'bcryptjs';
import { db } from '../config/database';
import { runMigrations } from './migrate';

export async function seedDatabase() {
  console.log('🌱 Seeding database for SurakshaAR Platform...');

  // Ensure migrations are run first
  await runMigrations();

  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10);
  const trainerPasswordHash = await bcrypt.hash('Trainer@123', 10);
  const workerPasswordHash = await bcrypt.hash('Worker@123', 10);

  // 1. One Organization
  const org = {
    id: 'org-ccl-ranchi-001',
    name: 'Central Coalfields Limited (CCL)',
    code: 'CCL-RANCHI',
    type: 'MINING',
    district: 'Ranchi',
    state: 'Jharkhand',
    contact_person: 'Er. Rajeshwar Singh (Chief Safety Officer)',
    contact_email: 'safety@cclmining.in',
  };

  await db.query(
    `INSERT OR REPLACE INTO organizations (id, name, code, type, district, state, contact_person, contact_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [org.id, org.name, org.code, org.type, org.district, org.state, org.contact_person, org.contact_email]
  );
  console.log(`✅ 1 Organization seeded: ${org.name}`);

  // 2. One Admin, One Trainer, and Three Demo Workers (Users)
  const users = [
    {
      id: 'usr-admin-001',
      org_id: org.id,
      email: 'admin@jharkhandsafety.gov.in',
      pwd: adminPasswordHash,
      name: 'DGMS Chief Safety Administrator',
      role: 'SUPER_ADMIN',
      phone: '+91-651-2400123',
    },
    {
      id: 'usr-trainer-001',
      org_id: org.id,
      email: 'trainer.anita@cclmining.in',
      pwd: trainerPasswordHash,
      name: 'Anita Murmu (Lead Safety Trainer)',
      role: 'TRAINER',
      phone: '+91-9835123984',
    },
    {
      id: 'usr-worker-001',
      org_id: org.id,
      email: 'birsa.soren@cclmining.in',
      pwd: workerPasswordHash,
      name: 'Birsa Soren',
      role: 'WORKER',
      phone: '+91-8789234125',
    },
    {
      id: 'usr-worker-002',
      org_id: org.id,
      email: 'soma.marandi@cclmining.in',
      pwd: workerPasswordHash,
      name: 'Soma Marandi',
      role: 'WORKER',
      phone: '+91-9123456789',
    },
    {
      id: 'usr-worker-003',
      org_id: org.id,
      email: 'ramesh.mahato@cclmining.in',
      pwd: workerPasswordHash,
      name: 'Ramesh Mahato',
      role: 'WORKER',
      phone: '+91-9431876543',
    },
  ];

  for (const u of users) {
    await db.query(
      `INSERT OR REPLACE INTO users (id, organization_id, email, password_hash, full_name, role, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [u.id, u.org_id, u.email, u.pwd, u.name, u.role, u.phone]
    );
  }
  console.log('✅ Users seeded: 1 Admin, 1 Trainer, 3 Workers.');

  // 3. Three Demo Workers Profile
  const workers = [
    {
      id: 'wrk-001',
      user_id: 'usr-worker-001',
      org_id: org.id,
      emp_id: 'CCL-EMP-8921',
      trade: 'Underground Coal Extraction Operator',
      aadhaar: 'XXXX-XXXX-4512',
      shift: 'MORNING',
      level: 'LEVEL_2',
      completed: 2,
      lang: 'sat',
      emergency: '+91-9835001122 (Shanti Soren)',
    },
    {
      id: 'wrk-002',
      user_id: 'usr-worker-002',
      org_id: org.id,
      emp_id: 'CCL-EMP-3310',
      trade: 'Blast Furnace Gas Maintenance Technician',
      aadhaar: 'XXXX-XXXX-8923',
      shift: 'ROTATIONAL',
      level: 'LEVEL_1',
      completed: 1,
      lang: 'hi',
      emergency: '+91-9431998877 (Anil Marandi)',
    },
    {
      id: 'wrk-003',
      user_id: 'usr-worker-003',
      org_id: org.id,
      emp_id: 'CCL-EMP-4420',
      trade: 'Ventilation & Shaft Rescue Crew',
      aadhaar: 'XXXX-XXXX-1029',
      shift: 'NIGHT',
      level: 'LEVEL_3',
      completed: 3,
      lang: 'en',
      emergency: '+91-9835443322 (Sunita Mahato)',
    },
  ];

  for (const w of workers) {
    await db.query(
      `INSERT OR REPLACE INTO workers (id, user_id, organization_id, employee_id, trade_role, aadhaar_hash, shift, current_safety_level, total_trainings_completed, preferred_language, emergency_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [w.id, w.user_id, w.org_id, w.emp_id, w.trade, w.aadhaar, w.shift, w.level, w.completed, w.lang, w.emergency]
    );
  }
  console.log('✅ 3 Demo Workers seeded (Santali, Hindi, English preferences).');

  // 4. Two Training Modules: Fire & Explosion Response, Gas Leak & Confined Space Protocol
  const modFire = {
    id: 'mod-fire-001',
    code: 'MOD-FIRE-EXP-01',
    title: 'Fire & Explosion Response',
    desc: 'Emergency response protocol for methane ignition, dry chemical extinguisher activation, air door barricading, and underground coal mine evacuation.',
    cat: 'FIRE_EXPLOSION',
    diff: 'INTERMEDIATE',
    pass_pct: 80.0,
    duration: 15,
  };

  const modGas = {
    id: 'mod-gas-002',
    code: 'MOD-GAS-CONF-02',
    title: 'Gas Leak & Confined Space Protocol',
    desc: 'Multi-gas detector multi-point monitoring (CH4, CO, H2S, O2), forced ventilation staging, self-contained breathing apparatus (SCBA) donning, and zero-panic evacuation.',
    cat: 'GAS_LEAK_CONFINED_SPACE',
    diff: 'ADVANCED',
    pass_pct: 85.0,
    duration: 20,
  };

  for (const m of [modFire, modGas]) {
    await db.query(
      `INSERT OR REPLACE INTO training_modules (id, code, title, description, category, difficulty, pass_percentage, estimated_duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [m.id, m.code, m.title, m.desc, m.cat, m.diff, m.pass_pct, m.duration]
    );
  }
  console.log('✅ 2 Training Modules seeded.');

  // Scenarios for each module
  const scenarios = [
    {
      id: 'scen-fire-01',
      module_id: modFire.id,
      num: 1,
      title: 'Underground Coal Seam Methane Flare & Suppression',
      desc: 'Worker faces localized methane burn at cutting face. Must inspect wind velocity, isolate electrical mains, and deploy Class D/dry powder unit.',
      env: 'COAL_SEAM',
      hazard: 'CRITICAL',
      pass_score: 80.0,
    },
    {
      id: 'scen-gas-01',
      module_id: modGas.id,
      num: 1,
      title: 'Toxic CO & Methane Gas Pocket Breach in Deep Shaft',
      desc: 'Atmospheric monitor sounds rapid audible beeping (CO > 50 ppm, O2 < 19%). Worker must interpret detector, seal valve, and engage escape breathing apparatus.',
      env: 'CONFINED_TUNNEL',
      hazard: 'CRITICAL',
      pass_score: 85.0,
    },
  ];

  for (const s of scenarios) {
    await db.query(
      `INSERT OR REPLACE INTO training_scenarios (id, module_id, scenario_number, title, description, ar_environment_type, hazard_level, passing_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [s.id, s.module_id, s.num, s.title, s.desc, s.env, s.hazard, s.pass_score]
    );
  }
  console.log('✅ Scenarios seeded for both modules.');

  // Scenario steps (trilingual)
  const steps = [
    {
      id: 'step-fire-1-intro',
      scenario_id: 'scen-fire-01',
      order: 1,
      title: 'Fire Emergency Training Briefing',
      en: 'Welcome to Fire Emergency Training. This is a simulated training environment designed to reinforce DGMS emergency protocols. It is not a substitute for physical pit drills.',
      hi: 'अग्नि आपातकालीन प्रशिक्षण में आपका स्वागत है। यह एक सिम्युलेटेड प्रशिक्षण वातावरण है।',
      sat: 'ᱥᱮᱸᱜᱮᱞ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱴᱨᱮᱱᱤᱝ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ᱾ (Briefing)',
      action: 'ACKNOWLEDGE_BRIEFING',
      target: 'BriefingHUD_AR',
      time: 15,
      penalty: 0.0,
      hint: 'Tap anywhere on the briefing panel to confirm orientation.',
    },
    {
      id: 'step-fire-2-setup',
      scenario_id: 'scen-fire-01',
      order: 2,
      title: 'Environment & Hazard Surface Setup',
      en: 'Scan your physical floor surface using AR. Tap reticle to deploy simulated fire hazard, safety alarm, extinguisher options, and emergency exit.',
      hi: 'एआर का उपयोग करके फर्श को स्कैन करें और सिम्युलेटेड अग्नि खतरा, अलार्म और अग्निशामक स्थापित करें।',
      sat: 'ᱚᱛ ᱯᱟᱥᱱᱟᱣ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱥᱮᱸᱜᱮᱞ, ᱟᱞᱟᱨᱢ ᱫᱚᱦᱚᱭ ᱢᱮ (Deploy scene).',
      action: 'PLACE_ENVIRONMENT',
      target: 'PlacementReticle_AR',
      time: 30,
      penalty: 0.0,
      hint: 'Point your camera downward toward a flat, well-lit surface.',
    },
    {
      id: 'step-fire-3-hazard',
      scenario_id: 'scen-fire-01',
      order: 3,
      title: 'Hazard Identification (+20 Points)',
      en: 'A methane flare has erupted at the cutting face! Locate and tap directly on the active fire zone.',
      hi: 'कोयला कटिंग फेस पर आग भड़क गई है! सक्रिय अग्नि क्षेत्र का पता लगाएं और सीधे उस पर टैप करें।',
      sat: 'ᱠᱚᱭᱞᱟ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱥᱮᱸᱜᱮᱞ ᱡᱩᱞ ᱮᱱᱟ! ᱥᱮᱸᱜᱮᱞ ᱧᱮᱞ ᱠᱟᱛᱮ ᱴᱤᱯ ᱢᱮ (+20 Pts).',
      action: 'IDENTIFY_HAZARD',
      target: 'SimulatedFire_AR',
      time: 25,
      penalty: 20.0,
      hint: 'Look for the flashing orange/red flame hazard marker with warning boundary.',
    },
    {
      id: 'step-fire-4-alarm',
      scenario_id: 'scen-fire-01',
      order: 4,
      title: 'Emergency Alarm Activation (+15 Points)',
      en: 'Alert the mine pithead and ventilation station. Locate the red emergency pull station and trigger the alarm.',
      hi: 'खदान पिटहेड को सचेत करें। लाल आपातकालीन पुल स्टेशन ढूंढें और अलार्म बजाएं।',
      sat: 'ᱟᱞᱟᱨᱢ ᱪᱟᱹᱞᱩᱭ ᱢᱮ: ᱟᱨᱟᱜ ᱟᱯᱚᱛᱠᱟᱞᱤᱱ ᱥᱩᱭᱤᱪ ᱚᱨ ᱟᱬᱜᱚᱭ ᱢᱮ (+15 Pts).',
      action: 'ACTIVATE_ALARM',
      target: 'EmergencyAlarm_AR',
      time: 20,
      penalty: 15.0,
      hint: 'The alarm beacon is mounted on the distribution panel.',
    },
    {
      id: 'step-fire-5-select',
      scenario_id: 'scen-fire-01',
      order: 5,
      title: 'Extinguisher Selection (+15 Points)',
      en: 'Review extinguisher choices (Water, CO2, Dry Powder). Select the correct Class D / ABC Dry Chemical unit for industrial coal gas fire.',
      hi: 'अग्निशामक विकल्पों की समीक्षा करें। कोयला गैस आग के लिए सही क्लास डी सूखा पाउडर चुनें।',
      sat: 'ᱫᱟᱜ, CO2 ᱟᱨ ᱥᱩᱠᱷᱟ ᱯᱟᱣᱰᱟᱨ ᱢᱩᱫᱽ ᱨᱮ ᱴᱷᱤᱠ ᱯᱟᱣᱰᱟᱨ ᱢᱤᱥᱤᱱ ᱵᱟᱪᱷᱟᱣ ᱢᱮ (+15 Pts).',
      action: 'SELECT_EXTINGUISHER',
      target: 'Extinguisher_DryPowder_AR',
      time: 25,
      penalty: 15.0,
      hint: 'Caution: Water causes violent steam expansion on burning methane / coal dust!',
    },
    {
      id: 'step-fire-6-pass',
      scenario_id: 'scen-fire-01',
      order: 6,
      title: 'P.A.S.S. Suppression Procedure (+25 Points)',
      en: 'Perform mandatory 4-step sequence: [1] Pull Safety Pin, [2] Aim Nozzle at Base, [3] Squeeze Lever, [4] Sweep Across Fire.',
      hi: 'अनिवार्य 4-चरणीय क्रम करें: [1] पिन खींचें, [2] नोजल जड़ पर रखें, [3] लीवर दबाएं, [4] झाड़ू लगाएं।',
      sat: 'P.A.S.S. ᱱᱤᱭᱚᱢ: [1] ᱯᱤᱱ ᱚᱨ, [2] ᱱᱚᱡᱚᱞ ᱫᱚᱦᱚ, [3] ᱞᱤᱵᱷᱚᱨ ᱚᱛᱟ, [4] ᱪᱷᱤᱴᱠᱟᱹᱣ (+25 Pts).',
      action: 'COMPLETE_PASS_SEQUENCE',
      target: 'Extinguisher_DryPowder_AR',
      time: 40,
      penalty: 25.0,
      hint: 'Follow the exact sequential order: Pull -> Aim -> Squeeze -> Sweep.',
    },
    {
      id: 'step-fire-7-evacuate',
      scenario_id: 'scen-fire-01',
      order: 7,
      title: 'Emergency Evacuation Route (+25 Points)',
      en: 'Suppression complete. Turn and orient toward the green illuminated Emergency Escape Shaft Exit.',
      hi: 'आग नियंत्रित है। पीछे मुड़ें और हरे रंग के आपातकालीन निकास शाफ्ट की ओर बढ़ें।',
      sat: 'ᱦᱟᱹᱨᱭᱟᱹᱲ ᱡᱩᱞᱩᱜ ᱠᱟᱱ ᱵᱟᱦᱨᱮ ᱚᱰᱚᱠᱚᱜ ᱫᱩᱣᱟᱹᱨ ᱥᱮᱱ ᱢᱚᱦᱰᱟᱜ ᱢᱮ (+25 Pts).',
      action: 'EVACUATE_EXIT',
      target: 'EmergencyExit_AR',
      time: 25,
      penalty: 25.0,
      hint: 'Follow the glowing green lifeline arrows leading to the escape shaft.',
    },
    {
      id: 'step-fire-8-summary',
      scenario_id: 'scen-fire-01',
      order: 8,
      title: 'Competency Assessment & Sync',
      en: 'Drill completed. Evaluating hazard recognition speed, equipment accuracy, and sequence adherence.',
      hi: 'प्रशिक्षण संपन्न। प्रणाली योग्यता और अनुपालन का मूल्यांकन कर रही है।',
      sat: 'ᱴᱨᱮᱱᱤᱝ ᱯᱩᱨᱟᱹᱣ ᱮᱱᱟ᱾ ᱥᱚᱨᱠᱟᱨᱤ ᱨᱮᱠᱚᱨᱰ ᱨᱮ ᱥᱤᱝᱠ ᱦᱩᱭ ᱮᱱᱟ᱾',
      action: 'CONCLUDE_DRILL',
      target: 'SummaryHUD_AR',
      time: 15,
      penalty: 0.0,
      hint: 'Review score breakdown and certificate eligibility.',
    },
    {
      id: 'step-fire-1-1',
      scenario_id: 'scen-fire-01',
      order: 9,
      title: 'Gas Hazard Recognition (Alternate)',
      en: 'Locate the digital methane monitor on the coal wall and read the percentage.',
      hi: 'कोयला दीवार पर डिजिटल मीथेन मॉनिटर का पता लगाएं और प्रतिशत पढ़ें।',
      sat: 'ᱠᱚᱭᱞᱟ ᱵᱷᱤᱛᱨᱤ ᱨᱮ ᱰᱤᱡᱤᱴᱟᱞ ᱢᱤᱛᱷᱮᱱ ᱢᱚᱱᱤᱴᱚᱨ ᱧᱟᱢ ᱢᱮ ᱟᱨ ᱥᱟᱭᱠᱚᱲᱟ ᱯᱟᱲᱦᱟᱣ ᱢᱮ',
      action: 'SCAN_MONITOR',
      target: 'MethaneMonitor_AR',
      time: 30,
      penalty: 15.0,
      hint: 'Move your AR camera closer to the yellow telemetry box mounted near the seam.',
    },
    {
      id: 'step-fire-1-2',
      scenario_id: 'scen-fire-01',
      order: 10,
      title: 'Power Isolation Switch',
      en: 'Pull down the red emergency high-voltage electrical isolation breaker to prevent spark propagation.',
      hi: 'चिंगारी फैलने से रोकने के लिए लाल आपातकालीन विद्युत आइसोलेशन स्विच को नीचे खींचें।',
      sat: 'ᱥᱮᱸᱜᱮᱞ ᱪᱷᱟᱹᱨᱭᱟᱹᱣ ᱵᱚᱱᱫᱚ ᱞᱟᱹᱜᱤᱫ ᱟᱨᱟᱜ ᱤᱞᱮᱠᱴᱨᱤᱠ ᱥᱩᱭᱤᱪ ᱚᱨ ᱟᱬᱜᱚᱭ ᱢᱮ',
      action: 'PULL_LEVER',
      target: 'EmergencyBreaker_AR',
      time: 25,
      penalty: 20.0,
      hint: 'Find the electrical distribution panel marked with a danger lightning symbol.',
    },
    {
      id: 'step-gas-1-1',
      scenario_id: 'scen-gas-01',
      order: 1,
      title: 'Interpret Multi-Gas Alarm',
      en: 'Acknowledge the flashing 4-gas detector audio alarm and note Carbon Monoxide > 50 ppm.',
      hi: 'फ्लैशिंग 4-गैस डिटेक्टर अलार्म की पुष्टि करें और कार्बन मोनोऑक्साइड > 50 ppm की पुष्टि करें।',
      sat: '᱔-ᱜᱮᱥ ᱰᱤᱴᱮᱠᱴᱚᱨ ᱨᱮᱱᱟᱜ ᱟᱞᱟᱨᱢ ᱟᱸᱡᱚᱢ ᱢᱮ ᱟᱨ ᱵᱤᱥ ᱜᱮᱥ ᱪᱤᱱᱦᱟᱹᱣ ᱢᱮ',
      action: 'ACKNOWLEDGE_ALARM',
      target: 'MultiGasDetector_AR',
      time: 20,
      penalty: 20.0,
      hint: 'Tap the blinking red gas detector icon to verify toxic gas threshold.',
    },
    {
      id: 'step-gas-1-2',
      scenario_id: 'scen-gas-01',
      order: 2,
      title: 'Don Self-Rescuer Breathing Apparatus',
      en: 'Unclip your emergency SCBA breather hood, bite into mouthpiece, and secure the nose clip.',
      hi: 'आपातकालीन एससीबीए श्वास हुड खोलें, माउथपीस मुंह में लगाएं और नोज क्लिप को कसें।',
      sat: 'ᱥᱟᱦᱮᱫ ᱦᱟᱛᱟᱣ ᱢᱩᱠᱷᱚᱴᱟ (SCBA) ᱦᱚᱨᱚᱜ ᱢᱮ ᱟᱨ ᱢᱩᱸ ᱠᱞᱤᱯ ᱵᱷᱤᱲᱟᱹᱣ ᱢᱮ',
      action: 'DON_SCBA',
      target: 'SCBA_Hood_AR',
      time: 30,
      penalty: 30.0,
      hint: 'In toxic atmospheres, the breathing apparatus must be sealed within 30 seconds.',
    },
  ];

  for (const st of steps) {
    await db.query(
      `INSERT OR REPLACE INTO scenario_steps (id, scenario_id, step_order, title, instruction_en, instruction_hi, instruction_sat, expected_action, target_ar_object, time_limit_seconds, penalty_points, hint_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [st.id, st.scenario_id, st.order, st.title, st.en, st.hi, st.sat, st.action, st.target, st.time, st.penalty, st.hint]
    );
  }
  console.log('✅ Scenario steps seeded.');

  // 5. Training Attempts (Realistic historical sessions with Passed and Failed attempts)
  const attempts = [
    {
      id: 'att-birsa-001',
      worker_id: 'wrk-001',
      scenario_id: 'scen-fire-01',
      attempt_number: 1,
      start_time: '2026-09-28T08:30:00Z',
      end_time: '2026-09-28T08:34:10Z',
      duration_seconds: 250,
      is_offline: 0,
      sync_status: 'SYNCED',
      score: 72.0,
      passed: 0, // failed initial attempt
    },
    {
      id: 'att-birsa-002',
      worker_id: 'wrk-001',
      scenario_id: 'scen-fire-01',
      attempt_number: 2,
      start_time: '2026-10-02T09:15:00Z',
      end_time: '2026-10-02T09:18:42Z',
      duration_seconds: 222,
      is_offline: 0,
      sync_status: 'SYNCED',
      score: 92.5,
      passed: 1, // passed re-attempt
    },
    {
      id: 'att-soma-001',
      worker_id: 'wrk-002',
      scenario_id: 'scen-gas-01',
      attempt_number: 1,
      start_time: '2026-10-01T14:20:10Z',
      end_time: '2026-10-01T14:23:15Z',
      duration_seconds: 185,
      is_offline: 1,
      sync_status: 'SYNCED',
      score: 88.0,
      passed: 1,
    },
    {
      id: 'att-ramesh-001',
      worker_id: 'wrk-003',
      scenario_id: 'scen-fire-01',
      attempt_number: 1,
      start_time: '2026-10-03T08:40:00Z',
      end_time: '2026-10-03T08:42:50Z',
      duration_seconds: 170,
      is_offline: 0,
      sync_status: 'SYNCED',
      score: 96.0,
      passed: 1,
    },
  ];

  for (const a of attempts) {
    await db.query(
      `INSERT OR REPLACE INTO training_attempts (id, worker_id, scenario_id, attempt_number, start_time, end_time, duration_seconds, is_offline, sync_status, score, passed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [a.id, a.worker_id, a.scenario_id, a.attempt_number, a.start_time, a.end_time, a.duration_seconds, a.is_offline, a.sync_status, a.score, a.passed]
    );
  }
  console.log('✅ Training attempts seeded (including 1 failed attempt and 3 passed attempts).');

  // 6. Attempt Actions & Mistakes Telemetry
  const actions = [
    {
      id: 'act-001',
      attempt_id: 'att-birsa-001',
      step_id: 'step-fire-1-2',
      time: '2026-09-28T08:32:00Z',
      action_type: 'DELAYED_ELECTRICAL_ISOLATION',
      object_interacted: 'EmergencyBreaker_AR',
      is_correct: 0,
      reaction_ms: 18400,
      penalty: 20.0,
      telemetry: JSON.stringify({ reason: 'Exceeded 15s power isolation time limit', mistake_tag: 'Delayed Breaker Pull' }),
    },
    {
      id: 'act-002',
      attempt_id: 'att-soma-001',
      step_id: 'step-gas-1-2',
      time: '2026-10-01T14:21:40Z',
      action_type: 'SCBA_SEAL_DELAY',
      object_interacted: 'SCBA_Hood_AR',
      is_correct: 1,
      reaction_ms: 12000,
      penalty: 10.0,
      telemetry: JSON.stringify({ reason: 'Nose clip adjustment delayed by 4s', mistake_tag: 'SCBA Adjustment Latency' }),
    },
    {
      id: 'act-003',
      attempt_id: 'att-birsa-002',
      step_id: 'step-fire-1-1',
      time: '2026-10-02T09:15:35Z',
      action_type: 'SCAN_MONITOR',
      object_interacted: 'MethaneMonitor_AR',
      is_correct: 1,
      reaction_ms: 8100,
      penalty: 0.0,
      telemetry: JSON.stringify({ accuracy: 0.98 }),
    },
  ];

  for (const ac of actions) {
    await db.query(
      `INSERT OR REPLACE INTO attempt_actions (id, attempt_id, step_id, action_timestamp, action_type, object_interacted, is_correct, reaction_time_ms, penalty_applied, telemetry_json)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [ac.id, ac.attempt_id, ac.step_id, ac.time, ac.action_type, ac.object_interacted, ac.is_correct, ac.reaction_ms, ac.penalty, ac.telemetry]
    );
  }
  console.log('✅ Attempt actions and telemetry mistakes seeded.');

  // 7. Assessment Results
  const assessments = [
    {
      id: 'asmt-001',
      attempt_id: 'att-birsa-002',
      worker_id: 'wrk-001',
      total_score: 92.5,
      pct: 92.5,
      summary: 'Excellent reaction speed in secondary attempt. Fast power cutoff and accurate sweep.',
      hazard_score: 95.0,
      speed_score: 90.0,
      accuracy_score: 92.5,
      passed: 1,
    },
    {
      id: 'asmt-002',
      attempt_id: 'att-soma-001',
      worker_id: 'wrk-002',
      total_score: 88.0,
      pct: 88.0,
      summary: 'Adequate multi-gas detection acknowledgement. Minor delay in SCBA tensioning.',
      hazard_score: 90.0,
      speed_score: 84.0,
      accuracy_score: 90.0,
      passed: 1,
    },
    {
      id: 'asmt-003',
      attempt_id: 'att-ramesh-001',
      worker_id: 'wrk-003',
      total_score: 96.0,
      pct: 96.0,
      summary: 'Flawless execution. Breaker pulled within 5s, perfect extinguisher distance maintained.',
      hazard_score: 98.0,
      speed_score: 95.0,
      accuracy_score: 95.0,
      passed: 1,
    },
  ];

  for (const as of assessments) {
    await db.query(
      `INSERT OR REPLACE INTO assessment_results (id, attempt_id, worker_id, total_score, max_possible_score, percentage, evaluation_summary, hazard_awareness_score, reaction_speed_score, protocol_accuracy_score, passed)
       VALUES ($1, $2, $3, $4, 100.0, $5, $6, $7, $8, $9, $10)`,
      [as.id, as.attempt_id, as.worker_id, as.total_score, as.pct, as.summary, as.hazard_score, as.speed_score, as.accuracy_score, as.passed]
    );
  }
  console.log('✅ Assessment evaluations seeded.');

  // 8. Certificates (1 active valid, 1 expiring soon within 30 days)
  const certs = [
    {
      id: 'cert-001',
      num: 'JH-MIN-2026-CCL-08492',
      worker_id: 'wrk-001',
      module_id: modFire.id,
      attempt_id: 'att-birsa-002',
      issue: '2026-10-02',
      expiry: '2028-10-02', // 2 years valid
      qr_data: JSON.stringify({ certNo: 'JH-MIN-2026-CCL-08492', worker: 'Birsa Soren', org: 'CCL-RANCHI' }),
      sig: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'ACTIVE',
    },
    {
      id: 'cert-002',
      num: 'JH-MIN-2024-CCL-01048',
      worker_id: 'wrk-003',
      module_id: modFire.id,
      attempt_id: 'att-ramesh-001',
      issue: '2024-10-25',
      expiry: '2026-10-25', // expiring in 22 days!
      qr_data: JSON.stringify({ certNo: 'JH-MIN-2024-CCL-01048', worker: 'Ramesh Mahato', org: 'CCL-RANCHI' }),
      sig: 'SHA256:7a94bc12304910248a881920cd4912cb102a90184b2e8119c5a14f9012a9bc41',
      status: 'ACTIVE',
    },
  ];

  for (const c of certs) {
    await db.query(
      `INSERT OR REPLACE INTO certificates (id, certificate_number, worker_id, module_id, attempt_id, issue_date, expiry_date, qr_code_data, digital_signature, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [c.id, c.num, c.worker_id, c.module_id, c.attempt_id, c.issue, c.expiry, c.qr_data, c.sig, c.status]
    );
  }
  console.log('✅ Certificates seeded (1 valid active, 1 expiring soon in October).');

  console.log('🎉 Comprehensive Database Seeding Complete!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed execution completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}
