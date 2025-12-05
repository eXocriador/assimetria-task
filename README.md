# Auto-Generated Blog Technical Challenge

This challenge implements a small monorepo where a React + TypeScript frontend consumes a Node.js + Express + TypeScript backend backed by PostgreSQL. The backend periodically calls an external AI text generation API (HuggingFace Inference recommended) to auto-create new blog posts, stores them, and exposes REST endpoints the UI can consume. Docker images wrap both apps, and the deployment target is AWS (EC2, CodeBuild, and ECR).

### Core Features
- List all articles with metadata from PostgreSQL.
- View a single article by `id`, including the AI-generated body.
- Daily automation that generates and persists at least one new article.
- Database seeded with a minimum of three base articles to keep the feed populated on first boot.

## Local Development
1. Clone the repository and install dependencies:
   - Frontend: `cd frontend && npm install`
   - Backend: `cd backend && npm install`
2. Start PostgreSQL via Docker Compose or a local instance and run migrations/seed scripts.
3. Launch backend (`npm run dev`) and frontend (`npm run dev`) in separate terminals; both rely on shared `.env` values.
4. Use the provided scripts to trigger the daily generator manually for testing (e.g., `npm run generate:article`).

## Deployment Overview
- Build Docker images for frontend and backend, tag them with the commit SHA, and push to AWS ECR.
- AWS CodeBuild pulls the repo, runs tests, builds/pushes containers, and updates image definitions.
- AWS EC2 (or an Auto Scaling group behind an ALB) pulls the latest images from ECR and restarts the services through a user-data or systemd script.
- Scheduled jobs (e.g., Amazon EventBridge calling an ECS task or EC2 cron) ensure the daily article generation runs in production.

## AWS Resources
- **ECR**: Stores versioned Docker images for backend and frontend.
- **CodeBuild**: CI pipeline that tests, builds, and pushes container images.
- **EC2**: Hosts the running containers (optionally via ECS on EC2 or docker-compose on the VM).
- **RDS for PostgreSQL**: Managed database storing articles and metadata.
- **EventBridge / CloudWatch Events**: Schedules the daily article generation task.
- **IAM Roles & Secrets Manager**: Securely stores environment variables, database credentials, and AI API keys.

## Environment Variables
- `PORT` / `FRONTEND_PORT`: Port bindings for backend and frontend dev servers.
- `DATABASE_URL` or `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE`: PostgreSQL connection string.
- `HUGGING_FACE_API_URL`: Base URL for the chosen inference endpoint.
- `HUGGING_FACE_API_KEY`: Token used to authenticate the article generation requests.
- `CRON_GENERATE_SCHEDULE`: Cron expression controlling the automated generator.
- `AWS_REGION`, `AWS_ACCOUNT_ID`, `ECR_REPOSITORY`: Used by build/deploy scripts for pushing Docker images.
