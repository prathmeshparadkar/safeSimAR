export const SCHEMA_SQL = `
-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('MINING', 'STEEL', 'MANUFACTURING', 'MICA_PROCESSING')),
    district TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Jharkhand',
    contact_person TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users (Role Based Access)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER', 'WORKER')),
    phone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- 3. Workers (Extended profile for industrial personnel)
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    organization_id TEXT NOT NULL,
    employee_id TEXT UNIQUE NOT NULL,
    trade_role TEXT NOT NULL,
    aadhaar_hash TEXT,
    shift TEXT NOT NULL CHECK(shift IN ('MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL')),
    current_safety_level TEXT NOT NULL DEFAULT 'LEVEL_1',
    total_trainings_completed INTEGER NOT NULL DEFAULT 0,
    preferred_language TEXT NOT NULL DEFAULT 'hi' CHECK(preferred_language IN ('en', 'hi', 'sat')),
    emergency_contact TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- 4. Training Modules
CREATE TABLE IF NOT EXISTS training_modules (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('FIRE_EXPLOSION', 'GAS_LEAK_CONFINED_SPACE', 'HAZMAT', 'ELECTRICAL')),
    difficulty TEXT NOT NULL CHECK(difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    pass_percentage REAL NOT NULL DEFAULT 75.0,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 20,
    version TEXT NOT NULL DEFAULT '1.0.0',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Training Scenarios (AR Scenarios per module)
CREATE TABLE IF NOT EXISTS training_scenarios (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    scenario_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    ar_environment_type TEXT NOT NULL CHECK(ar_environment_type IN ('COAL_SEAM', 'CONFINED_TUNNEL', 'CONVEYOR_BELT', 'CHEMICAL_STORAGE')),
    hazard_level TEXT NOT NULL CHECK(hazard_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    passing_score REAL NOT NULL DEFAULT 80.0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- 6. Scenario Steps (Targeted actions in AR workflow)
CREATE TABLE IF NOT EXISTS scenario_steps (
    id TEXT PRIMARY KEY,
    scenario_id TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    instruction_en TEXT NOT NULL,
    instruction_hi TEXT NOT NULL,
    instruction_sat TEXT NOT NULL,
    expected_action TEXT NOT NULL,
    target_ar_object TEXT NOT NULL,
    time_limit_seconds INTEGER NOT NULL DEFAULT 60,
    penalty_points REAL NOT NULL DEFAULT 10.0,
    hint_text TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id) ON DELETE CASCADE
);

-- 7. Training Assets (3D models, audio cues, markers)
CREATE TABLE IF NOT EXISTS training_assets (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK(asset_type IN ('GLB', 'TEXTURE', 'AUDIO', 'MARKER')),
    file_url TEXT NOT NULL,
    checksum TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE
);

-- 8. Training Attempts (AR session records)
CREATE TABLE IF NOT EXISTS training_attempts (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    scenario_id TEXT NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_seconds INTEGER,
    is_offline INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'SYNCED' CHECK(sync_status IN ('PENDING', 'SYNCED', 'CONFLICT')),
    score REAL DEFAULT 0.0,
    passed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (scenario_id) REFERENCES training_scenarios(id) ON DELETE CASCADE
);

-- 9. Attempt Actions (Detailed telemetry of worker interaction in AR)
CREATE TABLE IF NOT EXISTS attempt_actions (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    action_timestamp TEXT NOT NULL,
    action_type TEXT NOT NULL,
    object_interacted TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    reaction_time_ms INTEGER NOT NULL,
    penalty_applied REAL NOT NULL DEFAULT 0.0,
    telemetry_json TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (attempt_id) REFERENCES training_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES scenario_steps(id) ON DELETE CASCADE
);

-- 10. Assessment Results (Performance evaluation breakdown)
CREATE TABLE IF NOT EXISTS assessment_results (
    id TEXT PRIMARY KEY,
    attempt_id TEXT UNIQUE NOT NULL,
    worker_id TEXT NOT NULL,
    total_score REAL NOT NULL,
    max_possible_score REAL NOT NULL DEFAULT 100.0,
    percentage REAL NOT NULL,
    evaluation_summary TEXT NOT NULL,
    hazard_awareness_score REAL NOT NULL,
    reaction_speed_score REAL NOT NULL,
    protocol_accuracy_score REAL NOT NULL,
    passed INTEGER NOT NULL,
    evaluated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (attempt_id) REFERENCES training_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 11. Certificates (Verifiable credentials with QR)
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    certificate_number TEXT UNIQUE NOT NULL,
    worker_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    attempt_id TEXT UNIQUE NOT NULL,
    issue_date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    qr_code_data TEXT NOT NULL,
    qr_code_image_url TEXT,
    digital_signature TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES training_attempts(id) ON DELETE CASCADE
);

-- 12. Certificate Verifications (Audit log for compliance checks)
CREATE TABLE IF NOT EXISTS certificate_verifications (
    id TEXT PRIMARY KEY,
    certificate_id TEXT NOT NULL,
    verified_by_user_id TEXT,
    verified_at TEXT NOT NULL DEFAULT (datetime('now')),
    verifier_ip TEXT,
    verification_method TEXT NOT NULL CHECK(verification_method IN ('QR_SCAN', 'MANUAL_INPUT', 'API')),
    is_valid INTEGER NOT NULL,
    notes TEXT,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. Translations (Multilingual support for English, Hindi, and Santali)
CREATE TABLE IF NOT EXISTS translations (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    field_name TEXT NOT NULL,
    language_code TEXT NOT NULL CHECK(language_code IN ('en', 'hi', 'sat_olchiki', 'sat_latin')),
    translation_text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(entity_type, entity_id, field_name, language_code)
);

-- 14. Devices (Registered worker mobile devices for offline tracking)
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    device_fingerprint TEXT UNIQUE NOT NULL,
    device_model TEXT NOT NULL,
    os_version TEXT NOT NULL,
    ar_core_supported INTEGER NOT NULL DEFAULT 1,
    app_version TEXT NOT NULL,
    last_sync_time TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- 15. Sync Queue (Offline-first event and attempt store)
CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    worker_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_payload TEXT NOT NULL,
    client_timestamp TEXT NOT NULL,
    server_synced_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(sync_status IN ('QUEUED', 'PROCESSED', 'FAILED')),
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_workers_user ON workers(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_org ON workers(organization_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_module ON training_scenarios(module_id);
CREATE INDEX IF NOT EXISTS idx_steps_scenario ON scenario_steps(scenario_id);
CREATE INDEX IF NOT EXISTS idx_attempts_worker ON training_attempts(worker_id);
CREATE INDEX IF NOT EXISTS idx_attempts_scenario ON training_attempts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_actions_attempt ON attempt_actions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_cert_worker ON certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_cert_num ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_trans_lookup ON translations(entity_type, entity_id, language_code);
CREATE INDEX IF NOT EXISTS idx_sync_worker ON sync_queue(worker_id, sync_status);
`;
