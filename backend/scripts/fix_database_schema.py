import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection

print("🔧 Fixing database schema issues...")
print()

with connection.cursor() as cursor:
    # Fix 1: Add tier column to public_subscriptions
    print("1. Adding 'tier' column to public_subscriptions...")
    try:
        cursor.execute("""
            ALTER TABLE public_subscriptions 
            ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'BASIC';
        """)
        print("   ✅ Column added")
    except Exception as e:
        print(f"   ⚠️  {e}")
    
    # Fix 2: Add check constraint
    print("2. Adding tier constraint...")
    try:
        cursor.execute("""
            ALTER TABLE public_subscriptions
            DROP CONSTRAINT IF EXISTS public_subscriptions_tier_check;
        """)
        cursor.execute("""
            ALTER TABLE public_subscriptions
            ADD CONSTRAINT public_subscriptions_tier_check 
            CHECK (tier IN ('BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'));
        """)
        print("   ✅ Constraint added")
    except Exception as e:
        print(f"   ⚠️  {e}")
    
    # Fix 3: Update existing subscriptions
    print("3. Updating existing subscriptions with tier values...")
    try:
        cursor.execute("""
            UPDATE public_subscriptions
            SET tier = CASE
                WHEN price_monthly < 5000 THEN 'BASIC'
                WHEN price_monthly < 10000 THEN 'STANDARD'
                WHEN price_monthly < 20000 THEN 'PREMIUM'
                ELSE 'ENTERPRISE'
            END
            WHERE tier IS NULL OR tier = '';
        """)
        print("   ✅ Subscriptions updated")
    except Exception as e:
        print(f"   ⚠️  {e}")
    
    # Verify
    print()
    print("4. Verifying subscriptions...")
    cursor.execute("SELECT id, name, tier, price_monthly FROM public_subscriptions;")
    rows = cursor.fetchall()
    if rows:
        print(f"   ✅ Found {len(rows)} subscriptions:")
        for row in rows:
            print(f"      - {row[1]}: {row[2]} (₹{row[3]}/month)")
    else:
        print("   ⚠️  No subscriptions found")

print()
print("✅ Database schema fixes applied!")
print()
print("Next steps:")
print("1. Restart the backend server (Ctrl+C and run again)")
print("2. Try accessing Django admin again")
