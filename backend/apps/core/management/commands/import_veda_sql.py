"""
Import Veda Vidyalaya data using SQL script
"""
import os
from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Import Veda Vidyalaya data from SQL script'

    def handle(self, *args, **options):
        sql_file = r"G:\School Mgmt System\mock_data\Veda_files\veda_vidyalaya_schema_inserts.sql"
        
        if not os.path.exists(sql_file):
            self.stdout.write(self.style.ERROR(f"SQL file not found: {sql_file}"))
            return

        self.stdout.write(self.style.SUCCESS("Starting SQL import for Veda Vidyalaya..."))
        
        # Read SQL file
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # Switch to tenant schema
        schema_name = 'tenant_veda_vidyalaya'
        
        try:
            with connection.cursor() as cursor:
                # Set search path
                self.stdout.write(f"Switching to schema: {schema_name}")
                cursor.execute(f'SET search_path TO "{schema_name}"')
                
                # Add default timestamps for all inserts
                cursor.execute("SET timezone = 'UTC'")
                
                # Split SQL into individual statements
                statements = [s.strip() for s in sql_content.split(';') if s.strip()]
                
                total = len(statements)
                self.stdout.write(f"Executing {total} SQL statements...")
                
                success_count = 0
                error_count = 0
                
                for i, statement in enumerate(statements, 1):
                    if not statement or statement.startswith('--'):
                        continue
                    
                    try:
                        # Modify INSERT statements to include timestamps if missing
                        if statement.upper().startswith('INSERT INTO'):
                            # Check if created_at/updated_at are in the statement
                            if 'created_at' not in statement.lower():
                                # Add timestamps to INSERT
                                # Find the VALUES clause
                                if 'VALUES' in statement.upper():
                                    parts = statement.split('VALUES', 1)
                                    if len(parts) == 2:
                                        # Extract column list
                                        col_part = parts[0].strip()
                                        val_part = parts[1].strip()
                                        
                                        # Add timestamp columns
                                        if ')' in col_part:
                                            col_part = col_part.rstrip(')')
                                            col_part += ', created_at, updated_at)'
                                        
                                        # Add timestamp values
                                        if val_part.endswith(')'):
                                            val_part = val_part.rstrip(')')
                                            val_part += ", NOW(), NOW())"
                                        
                                        statement = col_part + ' VALUES ' + val_part
                        
                        cursor.execute(statement)
                        success_count += 1
                        
                        # Progress indicator
                        if i % 50 == 0:
                            self.stdout.write(f"Progress: {i}/{total} statements executed...")
                            
                    except Exception as e:
                        error_count += 1
                        # Only show first few errors to avoid spam
                        if error_count <= 5:
                            self.stdout.write(self.style.WARNING(f"Error in statement {i}: {str(e)[:150]}"))
                        # Continue on error instead of aborting
                        connection.connection.rollback()
                        cursor.execute(f'SET search_path TO "{schema_name}"')
                
                # Commit the transaction
                connection.connection.commit()
                self.stdout.write(self.style.SUCCESS(f"\n✅ Import Complete!"))
                self.stdout.write(f"  - Successful: {success_count}")
                self.stdout.write(f"  - Errors: {error_count}")
                
                # Verify data
                self.stdout.write("\n--- Data Verification ---")
                
                tables = [
                    'academic_years',
                    'classes',
                    'sections',
                    'subjects',
                    'students',
                    'staff_members',
                    'student_enrollments',
                    'transport_vehicles',
                    'transport_routes',
                    'library_books'
                ]
                
                for table in tables:
                    try:
                        cursor.execute(f'SELECT COUNT(*) FROM {table}')
                        count = cursor.fetchone()[0]
                        self.stdout.write(f"  {table}: {count} records")
                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f"  {table}: Error - {str(e)[:50]}"))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Import failed: {str(e)}"))
            import traceback
            traceback.print_exc()
