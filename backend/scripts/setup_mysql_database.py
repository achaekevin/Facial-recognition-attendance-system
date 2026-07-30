import os
import sys
import uuid
import datetime
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "sha256_crypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def setup_database():
    print("=" * 80)
    print("FACIAL RECOGNITION ATTENDANCE SYSTEM - MYSQL DATABASE SETUP")
    print("Target DB: facial_recognition_database")
    print("User: root | Host: localhost:3306")
    print("=" * 80)

    try:
        import pymysql
    except ImportError:
        print("pymysql module not installed. Installing pymysql...")
        os.system(f"{sys.executable} -m pip install pymysql")
        import pymysql

    try:
        connection = pymysql.connect(
            host="localhost",
            user="root",
            password="",
            port=3306,
            autocommit=True
        )
        print("[SUCCESS] Connected to MySQL Server at localhost:3306 successfully!")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MySQL Server: {e}")
        return False

    cursor = connection.cursor()

    sql_file_path = os.path.join(os.path.dirname(__file__), "init_facial_recognition_db.sql")
    if not os.path.exists(sql_file_path):
        print(f"[ERROR] SQL DDL script not found at {sql_file_path}")
        return False

    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_script = f.read()

    statements = [stmt.strip() for stmt in sql_script.split(";") if stmt.strip()]

    print(f"Executing DDL statements to create database 'facial_recognition_database' & 44 tables...")
    created_count = 0
    for stmt in statements:
        try:
            cursor.execute(stmt)
            if "CREATE TABLE" in stmt.upper():
                created_count += 1
        except Exception as e:
            if "1050" not in str(e):
                print(f"Statement note: {e}")

    print(f"[SUCCESS] Applied schema! Created/verified {created_count} database tables.")

    cursor.execute("USE `facial_recognition_database`;")
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")

    # Seed 5 Core System Roles
    roles = [
        ("super_admin", "Super Administrator", "Highest-privileged user with full unconstrained system control"),
        ("hr_admin", "HR Administrator", "Attendance administrator, user registration, face enrollment, shifts, and leave approvals"),
        ("lecturer_teacher", "Lecturer / Manager", "Departmental manager or lecturer oversight for assigned students/employees"),
        ("security_officer", "Security Officer", "Entrance monitoring, live feeds, unknown face alerts, visitors, and watchlists"),
        ("employee_student", "Employee / Student", "End user portal for self attendance, correction requests, and leave applications")
    ]

    for r_id, r_name, r_desc in roles:
        cursor.execute(
            "INSERT INTO `roles` (`id`, `name`, `description`) VALUES (%s, %s, %s) "
            "ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);",
            (r_id, r_name, r_desc)
        )

    # Seed Initial Organization & Department
    org_id = "org-main"
    cursor.execute(
        "INSERT INTO `organizations` (`id`, `name`, `email`, `phone`, `address`) VALUES (%s, %s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);",
        (org_id, "National Institute of Biometric Technology", "contact@institution.edu", "+1 (555) 000-1122", "100 Tech Parkway")
    )

    dept_id = "dept-cs"
    cursor.execute(
        "INSERT INTO `departments` (`id`, `organization_id`, `name`, `code`, `description`) VALUES (%s, %s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);",
        (dept_id, org_id, "Computer Science & Artificial Intelligence", "CSAI", "Department of Computer Science and AI Research")
    )

    # Seed Default System Accounts (@attendance.com / password321)
    hashed_pwd = get_password_hash("password321")

    users_seed = [
        ("usr-admin", "EMP-9001", "superadmin", "superadmin@attendance.com", "+1 (555) 234-5678", hashed_pwd, "Dr. Robert", "Vance", "Male", "active", org_id, dept_id, "super_admin"),
        ("usr-hr", "EMP-4002", "hradmin", "hradmin@attendance.com", "+1 (555) 876-5432", hashed_pwd, "Amanda", "Lewis", "Female", "active", org_id, dept_id, "hr_admin"),
        ("usr-lecturer", "EMP-3088", "lecturer", "lecturer@attendance.com", "+1 (555) 321-9876", hashed_pwd, "Prof. Sarah", "Jenkins", "Female", "active", org_id, dept_id, "lecturer_teacher"),
        ("usr-security", "SEC-001", "security", "security@attendance.com", "+1 (555) 432-1098", hashed_pwd, "Captain James", "Miller", "Male", "active", org_id, dept_id, "security_officer"),
        ("usr-student", "STU-2025-099", "student", "student@attendance.com", "+1 (555) 654-3210", hashed_pwd, "Alex", "Rivera", "Male", "active", org_id, dept_id, "employee_student"),
    ]

    for u_id, emp_no, uname, email, phone, pwd, fname, lname, gender, status, o_id, d_id, r_id in users_seed:
        cursor.execute(
            "INSERT INTO `users` (`id`, `employee_number_student_number`, `username`, `email`, `phone`, `password_hash`, `first_name`, `last_name`, `gender`, `status`, `organization_id`, `department_id`, `role_id`) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
            "ON DUPLICATE KEY UPDATE `email` = VALUES(`email`), `password_hash` = VALUES(`password_hash`), `role_id` = VALUES(`role_id`);",
            (u_id, emp_no, uname, email, phone, pwd, fname, lname, gender, status, o_id, d_id, r_id)
        )

    # Seed System Settings
    settings_data = [
        ("rec_threshold", "85.0"),
        ("liveness_enabled", "true"),
        ("quality_threshold", "75.0"),
        ("org_name", "National Institute of Biometric Technology")
    ]
    for key, val in settings_data:
        cursor.execute(
            "INSERT INTO `system_settings` (`id`, `key`, `value`) VALUES (%s, %s, %s) "
            "ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);",
            (str(uuid.uuid4()), key, val)
        )

    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")

    print("[SUCCESS] Seeded 5 default system accounts (@attendance.com / password321) into MySQL!")
    cursor.close()
    connection.close()
    print("=" * 80)
    print("DATABASE & ACCOUNT SETUP COMPLETE FOR 'facial_recognition_database'")
    print("=" * 80)
    return True

if __name__ == "__main__":
    setup_database()
