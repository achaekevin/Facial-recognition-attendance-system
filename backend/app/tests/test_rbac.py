import pytest
from app.authorization.rbac import RoleChecker
from app.models.models import UserModel

def test_role_checker_super_admin_bypass():
    checker = RoleChecker(allowed_roles=["hr_admin"])
    user = UserModel(id="usr-1", role="super_admin", status="active")
    result = checker(user=user)
    assert result.role == "super_admin"

def test_role_checker_allowed_role():
    checker = RoleChecker(allowed_roles=["hr_admin", "lecturer_teacher"])
    user = UserModel(id="usr-2", role="hr_admin", status="active")
    result = checker(user=user)
    assert result.role == "hr_admin"
