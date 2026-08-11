#!/usr/bin/env bash
# Run on the VPS via: ssh ... bash -s < this-file
# Mirrors sync_repo()/quick_update() in askpatron/designsync's
# deploy-container.sh — keep the two in sync if that logic changes.
set -euo pipefail

cd /apps/designsync-website
git fetch origin --prune
git reset --hard origin/main
test -f index.html || { echo "ABORT: website checkout is empty"; exit 1; }
echo "designsync-website HEAD: $(git log -1 --oneline)"

cd /apps/designsync
git fetch origin --prune
git reset --hard origin/main
echo "designsync HEAD: $(git log -1 --oneline)"

export GIT_COMMIT=$(git rev-parse HEAD)
docker compose -f docker-compose.prod.yml --env-file .env.production build --pull --parallel
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --force-recreate
docker image prune -f 2>/dev/null || true
echo "Deployment complete"
