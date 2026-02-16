
import os
import sys
import django
from django.db import connection

# Add project root to sys.path
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def hotfix_schema():
    print("Applying hotfix to tenant_veda_v9 schema...")
    with connection.cursor() as cursor:
        print("Adding columns to tenant_veda_v9.subjects...")
        
        # Add class_group
        try:
            cursor.execute("ALTER TABLE tenant_veda_v9.subjects ADD COLUMN class_group VARCHAR(20) DEFAULT 'PRIMARY';")
            print("Successfully added 'class_group' column.")
        except Exception as e:
            print(f"Skipped 'class_group' (unexpected error or already exists): {e}")

        # Add stream
        try:
            cursor.execute("ALTER TABLE tenant_veda_v9.subjects ADD COLUMN stream VARCHAR(20) DEFAULT 'GENERAL';")
            print("Successfully added 'stream' column.")
        except Exception as e:
            print(f"Skipped 'stream' (unexpected error or already exists): {e}")

        # Add indexes
        try:
            print("Creating indexes...")
            # Note: Index names must be unique per schema usually, but Django names them specifically.
            # We use IF NOT EXISTS if supported or try/except block.
            # Postgres supports IF NOT EXISTS for indexes in newer versions.
            
            cursor.execute("CREATE INDEX IF NOT EXISTS subjects_class_g_cbbc92_idx ON tenant_veda_v9.subjects (class_group);")
            cursor.execute("CREATE INDEX IF NOT EXISTS subjects_stream_0a6f66_idx ON tenant_veda_v9.subjects (stream);")
            cursor.execute("CREATE INDEX IF NOT EXISTS subjects_class_g_883212_idx ON tenant_veda_v9.subjects (class_group, stream);")
            print("Successfully created indexes.")
        except Exception as e:
            print(f"Index creation failed: {e}")

    print("Hotfix application complete.")

if __name__ == "__main__":
    hotfix_schema()
