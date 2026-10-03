# SurakshaAR REST API Specification (v1)

## Base URL
```
http://localhost:5000/api/v1
```

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2026-10-03T11:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message",
  "timestamp": "2026-10-03T11:00:00.000Z"
}
```

---

## Endpoints

### 1. System Health
* **Endpoint:** `GET /health`
* **Access:** Public
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "System is operational",
  "data": {
    "status": "pass",
    "service": "jharkhand-industrial-safety-ar-backend",
    "version": "1.0.0",
    "timestamp": "2026-10-03T11:00:00.000Z",
    "uptime_seconds": 128,
    "environment": "development",
    "database": {
      "engine": "sqlite",
      "status": "healthy",
      "error": null
    },
    "system": {
      "platform": "win32",
      "node_version": "v24.15.0",
      "free_memory_mb": 8412,
      "total_memory_mb": 16384
    }
  }
}
```

---

### 2. Authentication

#### `POST /auth/login`
* **Access:** Public
* **Request Body**:
```json
{
  "email": "admin@jharkhandsafety.gov.in",
  "password": "Admin@12345"
}
```
* **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-admin-001",
      "email": "admin@jharkhandsafety.gov.in",
      "fullName": "DGMS Chief Safety Administrator",
      "role": "SUPER_ADMIN",
      "organizationId": "org-ccl-ranchi-001",
      "organizationName": "Central Coalfields Limited (CCL)",
      "preferredLanguage": "hi"
    }
  }
}
```

#### `GET /auth/me`
* **Access:** Authenticated (Bearer Token required)
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response `200 OK`**: User profile with joined worker metadata.

---

### 3. Worker Management

#### `GET /workers`
* **Access:** Protected (`SUPER_ADMIN`, `ORG_ADMIN`, `TRAINER`)
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Query Parameters:** `organization_id` (optional)
* **Response `200 OK`**: Array of registered workers with user profile, organization details, and localization preferences.

#### `GET /workers/:id`
* **Access:** Protected (`SUPER_ADMIN`, `ORG_ADMIN`, `TRAINER`, `WORKER`)
* **Response `200 OK`**: Single worker record by ID.

---

### 4. Training Modules & AR Scenarios

#### `GET /modules`
* **Access:** Protected (Authenticated users)
* **Response `200 OK`**: List of all active modules with scenario counts.
  - `MOD-FIRE-EXP-01`: Fire & Explosion Response
  - `MOD-GAS-CONF-02`: Gas Leak & Confined Space Protocol

#### `GET /modules/:id`
* **Access:** Protected (Authenticated users)
* **Response `200 OK`**: Module details, nested AR scenarios, and scenario steps with trilingual instructions (English, Hindi, and Santali Ol Chiki).
