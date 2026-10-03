# SurakshaAR Database Schema Documentation

## Database Technology
- **ORM**: Prisma ORM v5.22.0
- **Primary Production Engine**: PostgreSQL
- **Development/Local Engine**: SQLite (Zero-config embedded driver with identical relational constraints)
- **Design Philosophy**: High relational integrity, strict check constraints, indexed foreign keys, and audit logging.

---

## Entity Relationship Overview

| Entity Name | Primary Key | Description |
|---|---|---|
| `organizations` | `id` (UUID) | Mining and industrial entities (e.g., CCL Ranchi, Tata Steel) |
| `users` | `id` (UUID) | User accounts with email, password hash, and assigned RBAC role |
| `workers` | `id` (UUID) | Worker profile (employee ID, trade specialization, shift, language) |
| `training_modules` | `id` (UUID) | Vocational curriculum (Fire & Explosion, Gas Leak Protocol) |
| `training_scenarios`| `id` (UUID) | Immersive AR training scenarios tied to a specific module |
| `scenario_steps` | `id` (UUID) | Step-by-step procedural actions with trilingual instructions |
| `training_attempts` | `id` (UUID) | AR simulation session attempts (score, duration, offline flag) |
| `attempt_actions` | `id` (UUID) | Fine-grained telemetry (reaction times, gestures, penalties) |
| `assessment_results`| `id` (UUID) | Algorithmic scoring breakdown (hazard awareness, speed, accuracy)|
| `certificates` | `id` (UUID) | Verifiable safety credentials with digital cryptographic signatures |
| `certificate_verifications` | `id` (UUID) | Audit trail of QR scans and verification inquiries |
| `devices` | `id` (UUID) | Registered rugged Android mobile devices running the AR client |
| `sync_queue` | `id` (UUID) | Idempotent queue for reconciling offline attempts |

---

## Schema Models (Prisma Definition)

### 1. `organizations`
- `id`: String (UUID)
- `name`: String
- `code`: String (Unique, e.g., `CCL-RANCHI`)
- `type`: Enum (`MINING`, `STEEL`, `MANUFACTURING`, `MICA_PROCESSING`)
- `district`: String
- `state`: String (Default: `Jharkhand`)
- `contact_person`: String
- `contact_email`: String
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### 2. `users`
- `id`: String (UUID)
- `organization_id`: String (Nullable FK -> `organizations.id`)
- `email`: String (Unique)
- `password_hash`: String (Bcrypt salted)
- `full_name`: String
- `role`: Enum (`SUPER_ADMIN`, `ORG_ADMIN`, `TRAINER`, `WORKER`)
- `phone`: String (Nullable)
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### 3. `workers`
- `id`: String (UUID)
- `user_id`: String (Unique FK -> `users.id`)
- `organization_id`: String (FK -> `organizations.id`)
- `employee_id`: String (Unique)
- `trade_role`: String
- `aadhaar_hash`: String (Nullable)
- `shift`: Enum (`MORNING`, `EVENING`, `NIGHT`, `ROTATIONAL`)
- `current_safety_level`: String (Default: `LEVEL_1`)
- `total_trainings_completed`: Int
- `preferred_language`: String (`sat`, `hi`, `en`)
- `emergency_contact`: String (Nullable)

### 4. `training_modules`
- `id`: String (UUID)
- `code`: String (Unique, e.g., `MOD-FIRE-EXP-01`)
- `title`: String
- `description`: String
- `category`: Enum (`FIRE_EXPLOSION`, `GAS_LEAK_CONFINED_SPACE`, `HAZMAT`, `ELECTRICAL`)
- `difficulty`: Enum (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`)
- `pass_percentage`: Float (Default: `75.0`)
- `estimated_duration_minutes`: Int

### 5. `training_scenarios` & `scenario_steps`
- `scenario_number`: Int
- `ar_environment_type`: Enum (`COAL_SEAM`, `CONFINED_TUNNEL`, `CONVEYOR_BELT`, `CHEMICAL_STORAGE`)
- `hazard_level`: Enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `instruction_en`: English instruction
- `instruction_hi`: Hindi instruction (Devanagari)
- `instruction_sat`: Santali instruction (Ol Chiki script + Romanized transliteration)

---

## Seed Datasets (Phase 1 Baseline)

1. **Organization**: Central Coalfields Limited (CCL), Ranchi
2. **Users**:
   - `admin@jharkhandsafety.gov.in` (SUPER_ADMIN)
   - `trainer.anita@cclmining.in` (TRAINER)
   - `birsa.soren@cclmining.in` (WORKER)
   - `soma.marandi@cclmining.in` (WORKER)
   - `ramesh.mahato@cclmining.in` (WORKER)
3. **Workers**:
   - Birsa Soren (CCL-EMP-8921, Underground Coal Cutter, Santali)
   - Soma Marandi (CCL-EMP-3310, Blast Furnace Operator, Hindi)
   - Ramesh Mahato (CCL-EMP-4420, Shaft Rescue Crew, English)
4. **Modules**:
   - `MOD-FIRE-EXP-01`: Fire & Explosion Response
   - `MOD-GAS-CONF-02`: Gas Leak & Confined Space Protocol
