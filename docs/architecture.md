# SurakshaAR System Architecture

## Overview
**SurakshaAR** is an enterprise-grade mobile Augmented Reality (AR) vocational training and compliance platform engineered for industrial and hazardous environments in Jharkhand—primarily underground coal mines, steel manufacturing plants, and mica processing units.

The system addresses Smart India Hackathon Problem Statement 26041 by providing practical, immersive emergency procedure training, verifiable cryptographic credentials, and multi-tier statutory compliance tracking (DGMS & Mines Act 1952).

---

## High-Level Topology

```
+--------------------------------------------------------------+
|                    Industrial Worker App                     |
|            (Android / Unity AR Foundation / ARCore)          |
|  - Trilingual Audio/HUD (Santali Ol Chiki, Hindi, English)   |
|  - Local Offline SQLite & Action Telemetry Queue             |
+------------------------------+-------------------------------+
                               |
                               | REST / Idempotent Sync
                               v
+--------------------------------------------------------------+
|                     SurakshaAR Backend                       |
|           (Node.js / Express / TypeScript / Prisma)          |
|                                                              |
|  +-------------------+  +-------------------+  +-----------+ |
|  | Auth & RBAC Engine|  | Sync & Telemetry  |  | Health &  | |
|  | (JWT, Bcrypt)     |  | Reconciliation    |  | Audit API | |
|  +-------------------+  +-------------------+  +-----------+ |
+------------------------------+-------------------------------+
                               |
        +----------------------+----------------------+
        |                                             |
        v                                             v
+-----------------------+                 +-----------------------+
|  Database Engine      |                 | Admin Web Dashboard   |
|  - PostgreSQL (Prod)  |                 | (React 18 / TS / Vite)|
|  - SQLite (Local Dev) |                 | - Compliance Metrics  |
|  - 13 Core Entities   |                 | - Worker Management   |
+-----------------------+                 | - QR Verification     |
+-----------------------+
```

---

## Directory Organization

```
SIH2NDPS/
├── mobile/                   # Android & Unity AR project (C# scripts, ARCore tracking, 3D assets)
├── server/                   # Backend REST API (Node.js, Express, TypeScript, Prisma)
│   ├── prisma/               # Prisma schema (schema.prisma)
│   ├── src/
│   │   ├── config/           # Database, environment, and Prisma clients
│   │   ├── controllers/      # Route controllers (Health, Auth, Workers, Modules)
│   │   ├── database/         # DDL migrations and seeders
│   │   ├── middleware/       # JWT auth, role validation, Zod request parser
│   │   ├── routes/           # Express API v1 routers
│   │   ├── services/         # Business logic layer
│   │   ├── types/            # Shared internal types
│   │   ├── utils/            # JWT, password hashing, and API response formatters
│   │   └── validators/       # Zod input schemas
│   └── dist/                 # Compiled JavaScript output
├── admin/                    # React + TypeScript + Vite web compliance dashboard
│   ├── src/
│   │   ├── components/       # Industrial safety layout and reusable widgets
│   │   ├── pages/            # Overview, Workers, Modules, Attempts, Certificates
│   │   └── index.css         # Dark industrial theme styling
│   └── dist/                 # Production static bundle
├── docs/                     # Architectural, database, and API specifications
│   ├── architecture.md
│   ├── database.md
│   └── api.md
└── shared/                   # Shared TypeScript models and interfaces
```

---

## Role-Based Access Control (RBAC)

The platform enforces four hierarchical permission levels:
1. **SUPER_ADMIN**: State-level safety directors (DGMS inspectors) with cross-organization oversight.
2. **ORG_ADMIN**: Mine managers and plant safety officers (CCL, Tata Steel) managing internal workforce compliance.
3. **TRAINER**: Certified safety instructors managing simulations and evaluating worker attempts.
4. **WORKER**: Industrial personnel undertaking AR training drills, viewing certificates, and synchronizing offline session logs.

---

## Offline-First Synchronization Strategy

In deep coal seams and remote mining shafts where network connectivity is intermittent or absent:
1. Mobile devices store module definitions and assets locally.
2. Training attempt actions and telemetry are recorded into a local SQLite queue.
3. Upon reconnecting to Wi-Fi/4G at the pithead or surface muster station, queued payloads are sent to `/api/v1/sync` with client-generated UUIDs for idempotent processing.
