# Auto-Generated Blog – Architecture

## Overview
- **Frontend**: React + TypeScript (Vite) single-page app that calls the backend REST API, renders the article feed, and provides a detail page per article. Env var `VITE_API_URL` points at the backend (localhost in dev, EC2/LB in prod).
- **Backend**: Node.js + Express + TypeScript server exposing `/api/articles`. It orchestrates article generation via a HuggingFace-compatible AI client, persists data in PostgreSQL, and exposes health + REST endpoints. Scheduled jobs run inside the Node process via `node-cron`.
- **Database**: PostgreSQL stores blog entries. Local dev runs via Docker Compose or Homebrew; production uses Amazon RDS or a managed Postgres instance.
- **AI Provider**: HuggingFace Inference API (text-generation) generates article titles and bodies. API key, model name, and provider are configured via env vars.

## Data Model
- `articles` table (see `backend/migrations/001_create_articles_table.sql`):
  - `id SERIAL PRIMARY KEY`
  - `title TEXT NOT NULL`
  - `slug TEXT UNIQUE NOT NULL`
  - `content TEXT NOT NULL`
  - `model TEXT`
  - `created_at TIMESTAMPTZ DEFAULT NOW()`
- Backend models return `Article` objects with `created_at` deserialized into `Date` instances; the frontend receives ISO strings.

## Backend Responsibilities
- **REST API** (`/api/articles`, `/api/articles/:id`) using Express routes defined in `backend/src/routes/articleRoutes.ts`.
- **Persistence Layer**: `backend/src/models/db.ts` configures a pooled `pg` client from env vars; `articleModel.ts` exposes CRUD helpers and aggregates.
- **AI Integration**: `backend/src/services/aiClient.ts` wraps HuggingFace requests, builds prompts, parses markdown-ish responses, and enforces configuration validation.
- **Cron + Seeding**: `backend/src/services/articleJob.ts` schedules a 01:00 daily generator and seeds at least three articles on startup. Jobs call the AI client, slugify titles, and persist via the model API while logging errors without crashing the process.
- **Server Boot**: `backend/src/index.ts` wires middleware, health endpoint, router mounting, job scheduling, and seeding kickoff. `.env` (see `.env.example`) provides DB + AI credentials.

## Frontend Responsibilities
- **API Client**: `frontend/src/api/client.ts` centralizes axios calls with `VITE_API_URL`, typed results, and shared interfaces.
- **Article List** (`ArticleListPage`): Loads all articles on mount, shows loading/error states, and links to individual posts; displays publish date + AI model badge.
- **Article Detail** (`ArticleDetailPage`): Uses `react-router-dom` params to fetch and show a single article, formatting metadata and rendering markdown-ish text as paragraphs.
- **Routing / Shell**: `App.tsx` hosts a minimal router with header links and shared styling (`App.css`, `index.css`).
- **Env**: `.env.example` instructs developers to point `VITE_API_URL` at their backend (swap to EC2/LB URL for prod).

## Deployment Flow
1. **Build & Push**: AWS CodeBuild runs `infra/buildspec.yml`, which logs in to ECR, builds Docker images for backend and frontend, tags them with the account registry, and pushes `latest`.
2. **Artifacts**: Build artifacts include the `infra` folder so scripts/compose files are available post-build.
3. **EC2 Runtime**: An EC2 instance (or ASG) runs Docker + Compose. `infra/scripts/init-ec2.sh` installs dependencies, logs into ECR, and fetches the production compose file. `infra/scripts/deploy.sh` pulls the latest images, uses `docker-compose.prod.yml`, and relaunches services with env vars read from `prod.env`.
4. **Services**: Production compose spins up Postgres (with persisted volume), backend (port 4000), and frontend (served via `serve` on port 3000 mapped to host port 80). Frontend calls the backend via `VITE_API_URL`.
5. **Automation**: The backend cron keeps generating one article per day; `ensureSeedArticles` guarantees at least three posts after each deployment or cold start.
