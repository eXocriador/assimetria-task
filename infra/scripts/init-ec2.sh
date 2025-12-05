#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"

echo "[Init] Updating packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

echo "[Init] Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg lsb-release unzip

echo "[Init] Installing Docker..."
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker "$USER" || true

echo "[Init] Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install || true
rm -rf aws awscliv2.zip

echo "[Init] Logging into ECR..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

APP_DIR=/opt/auto-blog
sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"

echo "[Init] Downloading docker-compose.prod.yml..."
# TODO: Replace the URL below with the raw GitHub URL of your docker-compose.prod.yml
curl -fsSL "<GITHUB_RAW_URL>/infra/docker-compose.prod.yml" -o "$APP_DIR/docker-compose.prod.yml"

cat <<'INSTRUCTIONS'

Initialization complete.

Next steps on the EC2 instance:
1. Create or copy your prod.env into /opt/auto-blog/prod.env with DB credentials and AI keys.
2. (Optional) Download the latest deploy.sh script into /opt/auto-blog/.
3. Run:
     cd /opt/auto-blog
     AWS_REGION=<your-region> ./deploy.sh
   or manually:
     docker compose -f docker-compose.prod.yml --env-file prod.env up -d

If you just added yourself to the docker group, log out and back in for the changes to take effect.
INSTRUCTIONS
