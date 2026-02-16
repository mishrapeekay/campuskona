"""
Script to explore PostgreSQL database structure and data
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
from django.apps import apps

def print_separator(title=""):
    """Print a visual separator"""
    print("\n" + "=" * 80)
    if title:
        print(f" {title}")
        print("=" * 80)

def get_database_info():
    """Get basic database connection info"""
    print_separator("DATABASE CONNECTION INFO")
    with connection.cursor() as cursor:
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"PostgreSQL Version: {version}\n")

        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()[0]
        print(f"Current Database: {db_name}\n")

        cursor.execute("SELECT current_user;")
        user = cursor.fetchone()[0]
        print(f"Connected as: {user}\n")

        cursor.execute("SHOW search_path;")
        search_path = cursor.fetchone()[0]
        print(f"Search Path: {search_path}\n")

def list_all_schemas():
    """List all schemas in the database"""
    print_separator("ALL SCHEMAS")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT schema_name
            FROM information_schema.schemata
            WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
            ORDER BY schema_name;
        """)
        schemas = cursor.fetchall()

        if schemas:
            print(f"Found {len(schemas)} schema(s):\n")
            for idx, (schema,) in enumerate(schemas, 1):
                print(f"  {idx}. {schema}")
        else:
            print("No user schemas found.")
    return [s[0] for s in schemas]

def list_tables_in_schema(schema_name='public'):
    """List all tables in a specific schema"""
    print_separator(f"TABLES IN SCHEMA: {schema_name}")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name,
                   pg_size_pretty(pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name))) as size
            FROM information_schema.tables
            WHERE table_schema = %s
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        """, [schema_name])
        tables = cursor.fetchall()

        if tables:
            print(f"Found {len(tables)} table(s):\n")
            print(f"{'#':<4} {'Table Name':<40} {'Size':<15}")
            print("-" * 60)
            for idx, (table, size) in enumerate(tables, 1):
                print(f"{idx:<4} {table:<40} {size:<15}")
        else:
            print(f"No tables found in schema '{schema_name}'.")
    return [t[0] for t in tables]

def count_records_in_tables(schema_name='public', tables=None):
    """Count records in all tables"""
    print_separator(f"RECORD COUNTS IN SCHEMA: {schema_name}")

    if not tables:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = %s
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
            """, [schema_name])
            tables = [t[0] for t in cursor.fetchall()]

    if tables:
        print(f"{'#':<4} {'Table Name':<40} {'Record Count':<15}")
        print("-" * 60)

        with connection.cursor() as cursor:
            for idx, table in enumerate(tables, 1):
                try:
                    if schema_name != 'public':
                        cursor.execute(f'SELECT COUNT(*) FROM "{schema_name}"."{table}";')
                    else:
                        cursor.execute(f'SELECT COUNT(*) FROM "{table}";')
                    count = cursor.fetchone()[0]
                    print(f"{idx:<4} {table:<40} {count:<15,}")
                except Exception as e:
                    print(f"{idx:<4} {table:<40} Error: {str(e)[:30]}")
    else:
        print(f"No tables to count in schema '{schema_name}'.")

def show_django_models():
    """Show all Django models"""
    print_separator("DJANGO MODELS")

    for app_config in apps.get_app_configs():
        models = app_config.get_models()
        if models and not app_config.name.startswith('django.'):
            print(f"\n[App] {app_config.label} ({app_config.name})")
            print("-" * 60)
            for model in models:
                table_name = model._meta.db_table
                print(f"  * {model.__name__:<30} -> {table_name}")

def sample_data_from_table(schema_name, table_name, limit=5):
    """Show sample data from a table"""
    print_separator(f"SAMPLE DATA: {schema_name}.{table_name} (First {limit} rows)")

    with connection.cursor() as cursor:
        # Get column names
        if schema_name != 'public':
            cursor.execute(f'SELECT * FROM "{schema_name}"."{table_name}" LIMIT 0;')
        else:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 0;')
        columns = [desc[0] for desc in cursor.description]

        # Get sample data
        if schema_name != 'public':
            cursor.execute(f'SELECT * FROM "{schema_name}"."{table_name}" LIMIT {limit};')
        else:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT {limit};')
        rows = cursor.fetchall()

        if rows:
            # Print column names
            print("\nColumns:", ", ".join(columns))
            print("-" * 80)

            # Print data
            for idx, row in enumerate(rows, 1):
                print(f"\nRow {idx}:")
                for col, val in zip(columns, row):
                    print(f"  {col}: {val}")
        else:
            print("No data found in this table.")

def main():
    """Main exploration function"""
    print("\n" + "POSTGRESQL DATABASE EXPLORER".center(80))

    try:
        # 1. Database connection info
        get_database_info()

        # 2. List all schemas
        schemas = list_all_schemas()

        # 3. Explore public schema
        tables = list_tables_in_schema('public')
        count_records_in_tables('public', tables)

        # 4. Show Django models
        show_django_models()

        # 5. If there are tenant schemas, explore the first one
        tenant_schemas = [s for s in schemas if s.startswith('school_') or (s != 'public' and 'pg_' not in s)]
        if tenant_schemas:
            print_separator(f"EXPLORING TENANT SCHEMA: {tenant_schemas[0]}")
            tenant_tables = list_tables_in_schema(tenant_schemas[0])
            count_records_in_tables(tenant_schemas[0], tenant_tables)

        # 6. Sample data from key tables
        if 'tenants_school' in tables:
            sample_data_from_table('public', 'tenants_school', 3)

        if 'authentication_user' in tables:
            sample_data_from_table('public', 'authentication_user', 3)

        print_separator("EXPLORATION COMPLETE")
        print("\n[SUCCESS] Database exploration completed successfully!\n")

    except Exception as e:
        print(f"\n[ERROR] Error during exploration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
