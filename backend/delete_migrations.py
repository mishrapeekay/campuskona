import os

files_to_delete = [
    r"g:\School Mgmt System\backend\apps\communication\migrations\0002_alter_event_options_alter_notice_options_and_more.py",
    r"g:\School Mgmt System\backend\apps\timetable\migrations\0002_alter_classtimetable_created_at_and_more.py",
    r"g:\School Mgmt System\backend\apps\finance\migrations\0002_alter_expense_created_at_alter_expense_id_and_more.py",
    r"g:\School Mgmt System\backend\apps\examinations\migrations\0004_alter_examination_created_at_alter_examination_id_and_more.py"
]

for f in files_to_delete:
    try:
        if os.path.exists(f):
            os.remove(f)
            print(f"✅ Deleted: {f}")
        else:
            print(f"⚠️ File not found: {f}")
    except Exception as e:
        print(f"❌ Error deleting {f}: {e}")
