import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=== Testing imports ===")
failed = False

try:
    from core.config import settings
    print("OK: config loaded")
except Exception as e:
    print("FAIL config:", e); failed = True

try:
    from core.security import get_password_hash, verify_password
    h = get_password_hash("test123")
    assert verify_password("test123", h), "verify failed"
    print("OK: security - hash/verify works")
except Exception as e:
    print("FAIL security:", e); failed = True

try:
    from models.schemas import UserRegister, UserResponse, TokenResponse, JobCreate
    print("OK: schemas imported")
except Exception as e:
    print("FAIL schemas:", e); failed = True

try:
    from models.models import User, UserRole
    u = User(email="t@t.com", full_name="T", hashed_password="abc", role=UserRole.RECRUITER)
    d = u.to_dict()
    print("OK: User model to_dict keys:", list(d.keys()))
except Exception as e:
    print("FAIL models:", e); failed = True

try:
    from api import auth, jobs, applications, ai_analysis, workflow, audit
    print("OK: all api modules imported successfully")
except Exception as e:
    import traceback
    print("FAIL api import:", e)
    traceback.print_exc()
    failed = True

if not failed:
    print("\n=== ALL IMPORTS OK ===")
else:
    print("\n=== SOME IMPORTS FAILED - see above ===")
