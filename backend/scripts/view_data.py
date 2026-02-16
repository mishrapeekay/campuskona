"""
Script to view actual data from PostgreSQL tables
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.db import connection
import json

def simple_table(rows, headers, max_width=40):
    """Simple table formatter without external dependencies"""
    if not rows:
        return "No data"

    # Calculate column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            cell_str = str(cell)
            if len(cell_str) > max_width:
                cell_str = cell_str[:max_width-3] + "..."
            col_widths[i] = max(col_widths[i], len(cell_str))

    # Create separator
    separator = "+" + "+".join(["-" * (w + 2) for w in col_widths]) + "+"

    # Build table
    result = [separator]

    # Header row
    header_row = "|"
    for i, h in enumerate(headers):
        header_row += f" {h:<{col_widths[i]}} |"
    result.append(header_row)
    result.append(separator)

    # Data rows
    for row in rows:
        data_row = "|"
        for i, cell in enumerate(row):
            cell_str = str(cell)
            if len(cell_str) > max_width:
                cell_str = cell_str[:max_width-3] + "..."
            data_row += f" {cell_str:<{col_widths[i]}} |"
        result.append(data_row)

    result.append(separator)
    return "\n".join(result)

def print_separator(title=""):
    """Print a visual separator"""
    print("\n" + "=" * 100)
    if title:
        print(f" {title}")
        print("=" * 100)

def view_table_data(table_name, schema='public', limit=10):
    """View data from a specific table"""
    print_separator(f"TABLE: {schema}.{table_name} (First {limit} rows)")

    with connection.cursor() as cursor:
        # Get total count
        if schema != 'public':
            cursor.execute(f'SELECT COUNT(*) FROM "{schema}"."{table_name}";')
        else:
            cursor.execute(f'SELECT COUNT(*) FROM "{table_name}";')
        total = cursor.fetchone()[0]

        if total == 0:
            print(f"\n[INFO] Table is empty (0 records)\n")
            return

        # Get column names
        if schema != 'public':
            cursor.execute(f'SELECT * FROM "{schema}"."{table_name}" LIMIT 0;')
        else:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT 0;')
        columns = [desc[0] for desc in cursor.description]

        # Get data
        if schema != 'public':
            cursor.execute(f'SELECT * FROM "{schema}"."{table_name}" LIMIT {limit};')
        else:
            cursor.execute(f'SELECT * FROM "{table_name}" LIMIT {limit};')
        rows = cursor.fetchall()

        # Format data for display
        formatted_rows = []
        for row in rows:
            formatted_row = []
            for val in row:
                if val is None:
                    formatted_row.append("NULL")
                elif isinstance(val, (dict, list)):
                    formatted_row.append(json.dumps(val, indent=2)[:50] + "...")
                elif isinstance(val, str) and len(val) > 50:
                    formatted_row.append(val[:47] + "...")
                else:
                    formatted_row.append(str(val))
            formatted_rows.append(formatted_row)

        print(f"\nTotal records: {total} | Showing: {len(rows)}")
        print("\n" + simple_table(formatted_rows, columns))

def main():
    """Main function to display important data"""
    print("\n" + "DATABASE DATA VIEWER".center(100))

    # 1. Schools/Tenants
    view_table_data('public_schools', limit=5)

    # 2. Subscriptions
    view_table_data('public_subscriptions', limit=5)

    # 3. Users
    print_separator("USERS - Key columns only")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, email, first_name, last_name, user_type, is_active, is_staff, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 10;
        """)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        formatted_rows = []
        for row in rows:
            formatted_row = []
            for val in row:
                if val is None:
                    formatted_row.append("NULL")
                elif isinstance(val, str) and len(val) > 40:
                    formatted_row.append(val[:37] + "...")
                else:
                    formatted_row.append(str(val))
            formatted_rows.append(formatted_row)

        print("\n" + simple_table(formatted_rows, columns))

    # 4. Students
    print_separator("STUDENTS - Key columns only")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, admission_number, first_name, last_name, date_of_birth,
                   admission_date, admission_status, gender, created_at
            FROM students
            ORDER BY created_at DESC
            LIMIT 10;
        """)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        formatted_rows = []
        for row in rows:
            formatted_row = []
            for val in row:
                if val is None:
                    formatted_row.append("NULL")
                elif isinstance(val, str) and len(val) > 40:
                    formatted_row.append(val[:37] + "...")
                else:
                    formatted_row.append(str(val))
            formatted_rows.append(formatted_row)

        print("\n" + simple_table(formatted_rows, columns))

    # 5. Staff Members
    print_separator("STAFF MEMBERS - Key columns only")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, employee_id, first_name, last_name, designation,
                   employment_type, employment_status, created_at
            FROM staff_members
            ORDER BY created_at DESC
            LIMIT 10;
        """)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        formatted_rows = []
        for row in rows:
            formatted_row = []
            for val in row:
                if val is None:
                    formatted_row.append("NULL")
                elif isinstance(val, str) and len(val) > 40:
                    formatted_row.append(val[:37] + "...")
                else:
                    formatted_row.append(str(val))
            formatted_rows.append(formatted_row)

        print("\n" + simple_table(formatted_rows, columns))

    # 6. Classes and Sections
    view_table_data('classes', limit=10)
    view_table_data('sections', limit=10)

    # 7. Academic Years and Boards
    view_table_data('academic_years', limit=5)
    view_table_data('boards', limit=5)

    # 8. Student Enrollments
    print_separator("STUDENT ENROLLMENTS - Key columns only")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, student_id, section_id, academic_year_id,
                   roll_number, enrollment_status, is_active, created_at
            FROM student_enrollments
            ORDER BY created_at DESC
            LIMIT 10;
        """)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()

        formatted_rows = []
        for row in rows:
            formatted_row = []
            for val in row:
                if val is None:
                    formatted_row.append("NULL")
                elif isinstance(val, str) and len(val) > 40:
                    formatted_row.append(val[:37] + "...")
                else:
                    formatted_row.append(str(val))
            formatted_rows.append(formatted_row)

        print("\n" + simple_table(formatted_rows, columns))

    # 9. Audit Log (recent activities) - Commented out due to schema differences
    # print_separator("RECENT AUDIT LOG (Last 15 entries)")

    # 10. Summary Statistics
    print_separator("DATABASE STATISTICS SUMMARY")
    with connection.cursor() as cursor:
        stats = []

        cursor.execute("SELECT COUNT(*) FROM users;")
        stats.append(["Total Users", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM students;")
        stats.append(["Total Students", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM staff_members;")
        stats.append(["Total Staff", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM classes;")
        stats.append(["Total Classes", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM sections;")
        stats.append(["Total Sections", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM student_enrollments;")
        stats.append(["Total Enrollments", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM public_schools;")
        stats.append(["Total Schools (Tenants)", cursor.fetchone()[0]])

        cursor.execute("SELECT COUNT(*) FROM core_auditlog;")
        stats.append(["Total Audit Logs", cursor.fetchone()[0]])

    print("\n" + simple_table(stats, ["Metric", "Count"]))

    print_separator("DATA VIEWING COMPLETE")
    print("\n[SUCCESS] All data displayed successfully!\n")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
