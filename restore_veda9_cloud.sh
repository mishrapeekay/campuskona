#!/bin/bash
# =============================================================================
# Restore Veda9 tenant on Cloud Server (campuskona.com / 195.35.21.129)
#
# INSTRUCTIONS:
#   1. Upload BOTH files to /tmp/ on the server via FileZilla:
#        - veda9_dump.sql
#        - restore_veda9_cloud.sh
#   2. SSH into the server
#   3. Run:  bash /tmp/restore_veda9_cloud.sh
# =============================================================================

set -e

# --- Cloud DB settings (edit if different on server) ---
DB_NAME="school_management"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DUMP_FILE="/tmp/veda9_dump.sql"

echo "================================================"
echo " Veda9 Tenant Restore — campuskona.com"
echo "================================================"

echo ""
echo "[1/6] Dropping old tenant_veda_v9 schema if exists..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" \
  -c "DROP SCHEMA IF EXISTS tenant_veda_v9 CASCADE;"

echo ""
echo "[2/6] Creating fresh tenant_veda_v9 schema..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" \
  -c "CREATE SCHEMA tenant_veda_v9;"

echo ""
echo "[3/6] Restoring 1080 students + all demo data..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" \
  -f "$DUMP_FILE"

echo ""
echo "[4/6] Registering Veda9 in public_schools..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
INSERT INTO public_schools (
  id, name, code, schema_name, subdomain, email, phone, address,
  city, state, country, pincode, primary_board, supported_boards,
  logo, primary_color, secondary_color,
  subscription_start_date, subscription_end_date,
  db_host, db_port, db_name, db_user, db_password,
  is_active, is_trial, auto_create_schema, settings,
  created_at, updated_at
) VALUES (
  '0323c27f-38ca-4a33-8dfe-a75786b1c6d4',
  'Veda Vidyalaya V9', 'VV9', 'tenant_veda_v9', 'veda9',
  'admin@vedavidyalaya.edu.in', '0751-2400001', 'City Center',
  'Gwalior', 'Madhya Pradesh', 'India', '474011',
  'CBSE', '[\"CBSE\"]',
  '', '#1976d2', '#dc004e',
  '2024-04-01', '2027-03-31',
  '', NULL, '', '', '',
  true, false, true, '{}',
  NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  schema_name = EXCLUDED.schema_name,
  is_active = true,
  updated_at = NOW();
"

echo ""
echo "[5/6] Registering domain for Veda9..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
INSERT INTO public_domains (
  id, domain, is_primary, is_https, is_active,
  created_at, updated_at, tenant_id, dns_record, is_verified, ssl_status
) VALUES (
  'b51f0a34-66b8-4cef-b0df-c4059bec2ba9',
  'veda9.campuskona.com',
  true, true, true,
  NOW(), NOW(),
  '0323c27f-38ca-4a33-8dfe-a75786b1c6d4',
  '', false, 'PENDING'
)
ON CONFLICT (id) DO UPDATE SET
  domain = 'veda9.campuskona.com',
  updated_at = NOW();
"

echo ""
echo "[6/6] Verifying restore..."
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -c "
SELECT
  (SELECT COUNT(*) FROM tenant_veda_v9.students) AS students,
  (SELECT COUNT(*) FROM tenant_veda_v9.staff_members) AS staff,
  (SELECT COUNT(*) FROM tenant_veda_v9.classes) AS classes,
  (SELECT COUNT(*) FROM tenant_veda_v9.sections) AS sections,
  (SELECT COUNT(*) FROM tenant_veda_v9.academic_years) AS academic_years;
"

echo ""
echo "================================================"
echo " DONE! Veda9 restore complete."
echo ""
echo " Login with tenant header:"
echo "   X-Tenant-Schema: tenant_veda_v9"
echo " Or subdomain: veda9.campuskona.com"
echo "================================================"
