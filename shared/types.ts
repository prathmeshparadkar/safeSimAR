export type UserRole = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TRAINER' | 'WORKER';

export type OrganizationType = 'MINING' | 'STEEL' | 'MANUFACTURING' | 'MICA_PROCESSING';

export type LanguageCode = 'en' | 'hi' | 'sat_olchiki' | 'sat_latin';

export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT' | 'ROTATIONAL';

export type ModuleCategory = 'FIRE_EXPLOSION' | 'GAS_LEAK_CONFINED_SPACE' | 'HAZMAT' | 'ELECTRICAL';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type AREnvironmentType = 'COAL_SEAM' | 'CONFINED_TUNNEL' | 'CONVEYOR_BELT' | 'CHEMICAL_STORAGE';

export type HazardLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SyncStatus = 'QUEUED' | 'PENDING' | 'SYNCED' | 'CONFLICT' | 'PROCESSED' | 'FAILED';

export type CertificateStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface User {
  id: string;
  organization_id?: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: OrganizationType;
  district: string;
  state: string;
  contact_person: string;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  user_id: string;
  organization_id: string;
  employee_id: string;
  trade_role: string;
  aadhaar_hash?: string;
  shift: ShiftType;
  current_safety_level: string;
  total_trainings_completed: number;
  preferred_language: 'en' | 'hi' | 'sat';
  emergency_contact?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingModule {
  id: string;
  code: string;
  title: string;
  description: string;
  category: ModuleCategory;
  difficulty: DifficultyLevel;
  pass_percentage: number;
  estimated_duration_minutes: number;
  version: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingScenario {
  id: string;
  module_id: string;
  scenario_number: number;
  title: string;
  description: string;
  ar_environment_type: AREnvironmentType;
  hazard_level: HazardLevel;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface ScenarioStep {
  id: string;
  scenario_id: string;
  step_order: number;
  title: string;
  instruction_en: string;
  instruction_hi: string;
  instruction_sat: string;
  expected_action: string;
  target_ar_object: string;
  time_limit_seconds: number;
  penalty_points: number;
  hint_text?: string;
  created_at: string;
}

export interface TrainingAsset {
  id: string;
  module_id: string;
  asset_name: string;
  asset_type: 'GLB' | 'TEXTURE' | 'AUDIO' | 'MARKER';
  file_url: string;
  checksum: string;
  file_size_bytes: number;
  version: string;
  created_at: string;
}

export interface TrainingAttempt {
  id: string;
  worker_id: string;
  scenario_id: string;
  attempt_number: number;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  is_offline: boolean;
  sync_status: SyncStatus;
  score: number;
  passed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttemptAction {
  id: string;
  attempt_id: string;
  step_id: string;
  action_timestamp: string;
  action_type: string;
  object_interacted: string;
  is_correct: boolean;
  reaction_time_ms: number;
  penalty_applied: number;
  telemetry_json?: string;
  created_at: string;
}

export interface AssessmentResult {
  id: string;
  attempt_id: string;
  worker_id: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  evaluation_summary: string;
  hazard_awareness_score: number;
  reaction_speed_score: number;
  protocol_accuracy_score: number;
  passed: boolean;
  evaluated_at: string;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  worker_id: string;
  module_id: string;
  attempt_id: string;
  issue_date: string;
  expiry_date: string;
  qr_code_data: string;
  qr_code_image_url?: string;
  digital_signature: string;
  status: CertificateStatus;
  created_at: string;
  updated_at: string;
}

export interface CertificateVerification {
  id: string;
  certificate_id: string;
  verified_by_user_id?: string;
  verified_at: string;
  verifier_ip?: string;
  verification_method: 'QR_SCAN' | 'MANUAL_INPUT' | 'API';
  is_valid: boolean;
  notes?: string;
}

export interface Translation {
  id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  language_code: LanguageCode;
  translation_text: string;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  worker_id: string;
  device_fingerprint: string;
  device_model: string;
  os_version: string;
  ar_core_supported: boolean;
  app_version: string;
  last_sync_time?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  id: string;
  device_id: string;
  worker_id: string;
  entity_type: string;
  entity_payload: string;
  client_timestamp: string;
  server_synced_at?: string;
  sync_status: SyncStatus;
  error_message?: string;
  retry_count: number;
  created_at: string;
}
