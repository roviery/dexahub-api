# DexaHub API

NestJS microservices backend for the DexaHub HR & attendance platform.

## Architecture Overview

The backend is a **microservices monorepo** — one HTTP-facing gateway that fans out to three TCP backend services over NestJS TCP transport.

```
Browser / Frontend
       │
       ▼  HTTP :3000
  api-gateway          ← only public-facing service (auth, file uploads, routing)
  /    |    \
 TCP  TCP   TCP
3001 3002  3003
 │    │      │
auth  user  attendance
svc   svc    svc
 │    │      │
 └────┴──────┘
      MySQL :3306
```

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 3000 (HTTP) | JWT validation, routing, file uploads |
| `auth-service` | 3001 (TCP) | Login, refresh, logout, token storage |
| `user-service` | 3002 (TCP) | Employee CRUD (HRD admin only) |
| `attendance-service` | 3003 (TCP) | Daily photo check-in and records |

## Prerequisites

- **Node.js** v20+
- **Docker** (for MySQL)
- **NestJS CLI** — `npm install -g @nestjs/cli`

## Quick Start (Local Dev)

### 1. Install dependencies

```bash
cd dexahub-api
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

The defaults in `.env.example` work out of the box for local development. The database credentials match what Docker Compose spins up.

### 3. Start MySQL

```bash
docker compose up mysql -d
```

Wait a few seconds for MySQL to be ready (you can check with `docker compose logs mysql`).

### 4. Start all four services

Open **four terminal tabs** and run one command per tab (all from `dexahub-api/`):

```bash
# Tab 1
nest start auth-service --watch

# Tab 2
nest start user-service --watch

# Tab 3
nest start attendance-service --watch

# Tab 4 — the HTTP entry point
nest start api-gateway --watch
```

All services must be running together for the app to work. The gateway will fail its microservice calls if a backend service is down.

### 5. Seed demo employees

```bash
npm run seed
```

This is idempotent — safe to run multiple times. Use `--fresh` to wipe and re-seed:

```bash
npm run seed -- --fresh
```

### 6. Verify the API is up

```bash
curl http://localhost:3000/api/v1
```

You should get a response (or a 404 — either way the gateway is alive).

## Test Accounts

After seeding, you can log in with these credentials:

| Role | Email | Password |
|---|---|---|
| HRD Admin | `admin@dexahub.com` | `Test@123!` |
| Employee | `employee.one@dexahub.com` | `Test@123!` |
| Employee | `employee.two@dexahub.com` | `Test@123!` |

> Check `scripts/seed.ts` for the full list of seeded accounts.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `dexahub` |
| `DB_PASS` | MySQL password | `dexahub_pass` |
| `DB_NAME` | MySQL database name | `dexahub` |
| `JWT_SECRET` | Access token signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | — |
| `AUTH_SERVICE_HOST` | auth-service host | `localhost` |
| `USER_SERVICE_HOST` | user-service host | `localhost` |
| `ATTENDANCE_SERVICE_HOST` | attendance-service host | `localhost` |

> In Docker Compose, set `*_SERVICE_HOST` to the compose service names (`auth-service`, `user-service`, `attendance-service`). For local dev, keep them as `localhost`.

## Running with Docker Compose (Full Stack)

To spin up the entire backend stack (including the frontend) in Docker:

```bash
# From dexahub-api/
docker compose up --build
```

This starts MySQL, all three backend services, the gateway on `:3000`, and the frontend on `:3004`.

## Scripts

```bash
# Development (run individually per service)
nest start <service> --watch     # auth-service | user-service | attendance-service | api-gateway

# Build
nest build <service>             # build a specific service
npm run build                    # build api-gateway (default)

# Seed
npm run seed                     # seed demo employees (idempotent)
npm run seed -- --fresh          # wipe employees table then re-seed

# Tests
npm test                         # all unit tests
npm test -- <pattern>            # e.g. npm test -- auth.service
npm run test:watch
npm run test:cov
npm run test:e2e

# Code quality
npm run lint
npm run format
```

## Project Structure

```
dexahub-api/
  apps/
    api-gateway/        # HTTP entry point — controllers, guards, file upload
    auth-service/       # login / refresh / logout
    user-service/       # employee CRUD
    attendance-service/ # check-in records
  libs/
    common/             # shared DTOs, guards, decorators, enums (@app/common)
  docker-compose.yml
  nest-cli.json         # monorepo config
```

## Key Conventions

- **Auth is gateway-only.** Backend services trust whatever the gateway forwards — they have no auth of their own.
- **Two `Employee` entities, one table.** `auth-service` and `user-service` each have their own `Employee` entity — both map the same `employees` table. If you change the schema in one, update the other.
- **No migrations.** TypeORM runs with `synchronize: true` — schema changes are applied automatically from entities on startup.
- **Exception propagation.** Throw standard NestJS `HttpException`s in any service. The `HttpToRpcExceptionFilter` / `RpcExceptionFilter` pair serializes them across TCP and reconstructs the correct HTTP status at the gateway.
- **Message patterns.** Gateway and services communicate via `{ cmd: 'service.action' }` strings. Keep them in sync between the gateway controller (`client.send`) and the service controller (`@MessagePattern`).
