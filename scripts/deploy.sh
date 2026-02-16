#!/bin/bash
# =============================================================================
# deploy.sh — Production deploy script for campuskona.com
#
# Usage:
#   ./scripts/deploy.sh           # deploy latest from main branch
#   ./scripts/deploy.sh --no-build  # restart containers without rebuilding
#
# What it does:
#   1. git pull latest code (including all migrations)
#   2. Build backend + frontend Docker images
#   3. Bring containers up (backend entrypoint auto-runs migrations)
#   4. Reload nginx config
# =============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"
cd /opt/campuskona

echo "========================================"
echo "  CampusKona Deploy — $(date)"
echo "========================================"

# --- 1. Pull latest code ---
echo ""
echo "[1/4] Pulling latest code from GitHub..."
git pull origin main

# --- 2. Build images (unless --no-build) ---
if [[ "$1" != "--no-build" ]]; then
    echo ""
    echo "[2/4] Building Docker images..."
    docker compose -f $COMPOSE_FILE build backend frontend celery_worker celery_beat
else
    echo ""
    echo "[2/4] Skipping build (--no-build flag)"
fi

# --- 3. Bring containers up ---
echo ""
echo "[3/4] Starting containers..."
docker compose -f $COMPOSE_FILE up -d

# Backend entrypoint.sh will automatically:
#   - Wait for DB
#   - Run migrate_schemas on public schema
#   - Run migrate_schemas on all non-demo tenant schemas
#   - Start gunicorn

# --- 4. Reload nginx ---
echo ""
echo "[4/4] Reloading nginx..."
docker exec school_mgmt_nginx_prod nginx -s reload 2>/dev/null || true

# --- Done ---
echo ""
echo "========================================"
echo "  Deploy complete!"
echo ""
echo "  Backend logs:  docker logs school_mgmt_backend_prod -f"
echo "  All containers: docker compose -f $COMPOSE_FILE ps"
echo "========================================"
