
import os
import sys
import django
from django.db import connection

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

def find_index():
    print("Finding index users_email_a7cfd1_idx...")
    with connection.cursor() as cursor:
        cursor.execute("SELECT schemaname, tablename, indexname FROM pg_indexes WHERE indexname = 'users_email_a7cfd1_idx'")
        rows = cursor.fetchall()
        for r in rows:
            print(f"Schema: {r[0]}, Table: {r[1]}, Index: {r[2]}")

if __name__ == "__main__":
    find_index()
