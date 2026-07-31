import asyncio
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import AsyncSessionLocal, engine, Base
from app.models.models import (
    UserModel,
    FaceEmbeddingModel,
    AttendanceModel,
    CameraModel,
    DepartmentModel,
    SystemSettingModel
)
from app.core.security import get_password_hash
from app.recognition.engine import biometric_engine

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(UserModel))
        if res.scalars().first():
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding database with default enterprise users (@attendance.com / password321)...")

        hashed_pwd = get_password_hash("password321")

        # 1. Super Admin
        admin = UserModel(
            name="Dr. Robert Vance",
            email="superadmin@attendance.com",
            hashed_password=hashed_pwd,
            phone="+1 (555) 234-5678",
            role="super_admin",
            category="lecturer",
            department_id="dept-1",
            department_name="School of Engineering & Tech",
            avatar=None,
            status="active",
            accuracy_score=99.4,
            employee_or_student_id="EMP-9001",
        )
        db.add(admin)

        # 2. HR Admin
        hr = UserModel(
            name="Amanda Lewis",
            email="hradmin@attendance.com",
            hashed_password=hashed_pwd,
            phone="+1 (555) 876-5432",
            role="hr_admin",
            category="employee",
            department_id="dept-4",
            department_name="Human Resources Administration",
            avatar=None,
            status="active",
            accuracy_score=98.9,
            employee_or_student_id="EMP-4002",
        )
        db.add(hr)

        # 3. Lecturer
        lecturer = UserModel(
            name="Prof. Sarah Jenkins",
            email="lecturer@attendance.com",
            hashed_password=hashed_pwd,
            phone="+1 (555) 321-9876",
            role="lecturer_teacher",
            category="lecturer",
            department_id="dept-2",
            department_name="Computer Science & AI Dept",
            avatar=None,
            status="active",
            accuracy_score=97.8,
            employee_or_student_id="EMP-3088",
        )
        db.add(lecturer)

        # 4. Security Officer
        security = UserModel(
            name="Captain James Miller",
            email="security@attendance.com",
            hashed_password=hashed_pwd,
            phone="+1 (555) 432-1098",
            role="security_officer",
            category="employee",
            department_id="dept-5",
            department_name="Campus Security & Operations",
            avatar=None,
            status="active",
            accuracy_score=99.8,
            employee_or_student_id="SEC-001",
        )
        db.add(security)

        # 5. Student / Employee
        student = UserModel(
            name="Alex Rivera",
            email="student@attendance.com",
            hashed_password=hashed_pwd,
            phone="+1 (555) 654-3210",
            role="employee_student",
            category="student",
            department_id="dept-2",
            department_name="Computer Science & AI Dept",
            avatar=None,
            status="active",
            accuracy_score=99.1,
            employee_or_student_id="STU-2025-099",
        )
        db.add(student)

        await db.commit()

        # Seed Cameras
        cam1 = CameraModel(
            name="Main Gate Entrance Alpha",
            location="Main Gate Gatehouse",
            department="Campus Security & Operations",
            stream_url="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
            status="online",
            ip_address="192.168.1.101",
            resolution="4K UHD (60fps)",
            fps=60,
            bitrate="8.4 Mbps",
            storage_used_gb=450.0,
            bandwidth_mbps=8.4,
            group_name="Perimeter Access"
        )
        db.add(cam1)

        # Seed Settings
        db.add(SystemSettingModel(id="default"))

        await db.commit()
        print("Database seeded successfully with default user accounts (@attendance.com / password321)!")

if __name__ == "__main__":
    asyncio.run(seed_data())
