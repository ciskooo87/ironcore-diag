#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/9] Checking required files..."
for f in .env.example README.md docs/EXTRACTION_NOTES.md package.json; do
  [[ -f "$f" ]] || { echo "Missing $f"; exit 1; }
done

if [[ ! -f .env ]]; then
  echo "WARN: .env not found (copy .env.example -> .env)"
fi

echo "[2/9] Node + npm versions"
node -v
npm -v

echo "[3/9] Install deps"
npm install >/dev/null

echo "[4/9] Build"
npm run build >/dev/null
[[ -d .next ]] || { echo "Missing .next after build"; exit 1; }

echo "[5/9] Check migration files"
ls -1 db/migrations/*.sql

echo "[6/9] Validate required env vars"
required_missing=0
for key in DATABASE_URL APP_PUBLIC_URL; do
  if [[ -z "${!key:-}" ]]; then
    echo "ERROR: $key is empty"
    required_missing=$((required_missing+1))
  fi
done
(( required_missing == 0 )) || { echo "Required env vars missing: $required_missing"; exit 1; }

echo "[7/9] DB connectivity check"
if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -c 'select now();' >/dev/null && echo "DB OK" || { echo "DB check failed"; exit 1; }
else
  echo "WARN: psql not installed, skipping DB check"
fi

echo "[8/9] Service path sanity (non-blocking)"
if command -v systemctl >/dev/null 2>&1; then
  systemctl cat ironcore-diag.service >/tmp/ironcore-diag.service.preflight 2>/dev/null || true
  if [[ -f /tmp/ironcore-diag.service.preflight ]]; then
    grep -q '/home/openclaw/.openclaw/workspace/ironcore-diag' /tmp/ironcore-diag.service.preflight \
      && echo "Service WorkingDirectory looks correct" \
      || echo "WARN: service file does not contain official ironcore-diag path"
  fi
fi

echo "[9/9] Summary"
echo "Preflight done"
