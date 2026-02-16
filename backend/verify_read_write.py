
import os
import sys
import django
import uuid
from datetime import datetime

# Add project root
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(project_root)

# Use dev settings for local verification
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

def verify_read_write():
    print("🔄 Initializing Django...")
    try:
        django.setup()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Django setup failed: {e}")
        return False

    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    test_email = f"test_rw_{uuid.uuid4()}@example.com"
    test_password = "TestPassword123!"
    # Generate a random 10-digit phone number to avoid unique constraint violations
    import random
    test_phone = f"{random.randint(6000000000, 9999999999)}"
    
    print(f"\n🧪 STARTING READ/WRITE TEST")
    
    # 1. Test WRITE
    print(f"📝 Attempting WRITE: Creating user {test_email} with phone {test_phone}...")
    try:
        user = User.objects.create_user(
            email=test_email, 
            password=test_password,
            phone=test_phone,
            first_name="Test",
            last_name="User"
        )
        print(f"✅ WRITE SUCCESS: Created User ID {user.id}")
    except Exception as e:
        print(f"❌ WRITE FAILED: {e}")
        return False

    # 2. Test READ
    print(f"📖 Attempting READ: Fetching user {test_email}...")
    try:
        fetched_user = User.objects.get(email=test_email)
        print(f"✅ READ SUCCESS: Found User ID {fetched_user.id} ({fetched_user.email})")
    except Exception as e:
        print(f"❌ READ FAILED: {e}")
        return False

    # 3. Validation
    if user.id != fetched_user.id:
        print("❌ DATA MISMATCH: IDs do not match!")
        return False

    # 4. Cleanup (Delete)
    print(f"🗑️ Attempting DELETE: Cleaning up...")
    try:
        fetched_user.delete()
        print(f"✅ DELETE SUCCESS")
    except Exception as e:
        print(f"⚠️ DELETE FAILED (Non-critical): {e}")

    print("\n🎉 DATABASE READ/WRITE VERIFICATION PASSED!")
    return True

if __name__ == "__main__":
    success = verify_read_write()
    sys.exit(0 if success else 1)
