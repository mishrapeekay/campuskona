#!/bin/bash
# =============================================================================
# Fix Frontend on Cloud Server (campuskona.com)
#
# INSTRUCTIONS:
#   1. Upload this file to /tmp/ on the server via FileZilla
#   2. SSH into the server
#   3. Run:  bash /tmp/fix_frontend_cloud.sh
# =============================================================================

set -e

APP_DIR="/root/school-mgmt"   # Adjust if your app is in a different directory
COMPOSE_FILE="docker-compose.prod.yml"

echo "================================================"
echo " Fix Frontend — campuskona.com"
echo "================================================"

# Detect app directory
if [ ! -f "$APP_DIR/$COMPOSE_FILE" ]; then
    # Try common alternatives
    for DIR in /opt/school-mgmt /home/*/school-mgmt /var/www/school-mgmt; do
        if [ -f "$DIR/$COMPOSE_FILE" ]; then
            APP_DIR="$DIR"
            break
        fi
    done
fi

if [ ! -f "$APP_DIR/$COMPOSE_FILE" ]; then
    echo "ERROR: Could not find $COMPOSE_FILE. Please set APP_DIR manually."
    echo "Run: find / -name docker-compose.prod.yml 2>/dev/null"
    exit 1
fi

echo "App directory: $APP_DIR"

# Fix 1: Patch vite.config.js to remove @headlessui/react from manualChunks
echo ""
echo "[1/3] Patching vite.config.js to remove @headlessui/react..."
sed -i "s/'vendor-ui': \['@headlessui\/react', '@heroicons\/react'\]/'vendor-ui': ['@heroicons\/react']/" \
    "$APP_DIR/frontend/vite.config.js"
echo "Done."

# Fix 2: Update students.js endpoint to use the correct nested path
echo ""
echo "[2/3] Verifying students.js endpoint..."
STUDENTS_JS="$APP_DIR/frontend/src/api/students.js"
if grep -q "STUDENTS_ENDPOINT = '/students/'" "$STUDENTS_JS"; then
    sed -i "s|STUDENTS_ENDPOINT = '/students/'|STUDENTS_ENDPOINT = '/students/students'|g" "$STUDENTS_JS"
    echo "Fixed: Changed /students/ to /students/students"
elif grep -q "STUDENTS_ENDPOINT = '/students/students'" "$STUDENTS_JS"; then
    echo "Already correct: /students/students"
else
    echo "WARNING: Could not find STUDENTS_ENDPOINT in $STUDENTS_JS — check manually"
fi

# Fix 3: Rebuild and restart frontend container
echo ""
echo "[3/3] Rebuilding frontend Docker container..."
cd "$APP_DIR"
docker-compose -f "$COMPOSE_FILE" build --no-cache frontend
docker-compose -f "$COMPOSE_FILE" up -d --force-recreate frontend

echo ""
echo "================================================"
echo " Frontend rebuild complete!"
echo ""
echo " Wait 10-15 seconds then visit:"
echo "   https://veda9.campuskona.com"
echo ""
echo " Students page should now show data."
echo "================================================"
