#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-prod.env}"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Compose file '$COMPOSE_FILE' not found."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file '$ENV_FILE' not found."
  exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo "[Deploy] Logging into ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "[Deploy] Pulling latest images..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull backend frontend || true

echo "[Deploy] Starting services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

echo "[Deploy] Current service status:"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
