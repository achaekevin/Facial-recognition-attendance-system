import os
import sys

def reset_database():
    print("=" * 80)
    print("FACIAL RECOGNITION ATTENDANCE SYSTEM - DATABASE PURGE & CLEAN RESET")
    print("Target DB: facial_recognition_database")
    print("=" * 80)

    try:
        import pymysql
    except ImportError:
        os.system(f"{sys.executable} -m pip install pymysql")
        import pymysql

    try:
        connection = pymysql.connect(
            host="localhost",
            user="root",
            password="",
            port=3306,
            database="facial_recognition_database",
            autocommit=True
        )
        print("[SUCCESS] Connected to MySQL Server.")
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return False

    cursor = connection.cursor()
    cursor.execute("SET FOREIGN_KEY_CHECKS=0;")

    # Tables to purge completely
    tables_to_clear = [
        "users",
        "user_profiles",
        "user_designations",
        "face_profiles",
        "face_embeddings",
        "enrollment_sessions",
        "recognition_logs",
        "unknown_faces",
        "watchlist",
        "liveness_checks",
        "attendance",
        "attendance_breaks",
        "attendance_corrections",
        "attendance_events",
        "leave_requests",
        "user_shifts",
        "visitors",
        "visitor_visits",
        "generated_reports",
        "notifications",
        "audit_logs",
        "system_logs",
        "dashboard_statistics",
        "files",
        "api_logs",
        "refresh_tokens",
        "password_resets",
        "login_history"
    ]

    print("Purging all mock user data, biometric profiles, and logs...")
    for table in tables_to_clear:
        try:
            cursor.execute(f"TRUNCATE TABLE `{table}`;")
            print(f"  [OK] Purged table: {table}")
        except Exception as e:
            print(f"  Note on {table}: {e}")

    cursor.execute("SET FOREIGN_KEY_CHECKS=1;")

    # Ensure 5 Core System Roles Exist
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

    print("[SUCCESS] All user data, fake profiles, and statistics cleared successfully!")
    print("Database is clean and ready for real production enrollments.")
    cursor.close()
    connection.close()
    return True

if __name__ == "__main__":
    reset_database()
