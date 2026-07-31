# Facial Recognition Attendance System

An enterprise-ready biometric attendance management platform built with FastAPI, OpenCV, InsightFace, and React 19. It replaces manual sign-in sheets and punch cards with automated facial recognition, liveness verification, and real-time reporting.

## Overview

The platform allows organizations to record employee and student attendance automatically through connected cameras, mobile devices, or dedicated terminal stations. It includes spoof protection, offline capabilities, location-based geofencing, multi-channel notifications, and compliance tools.

## Key Features

### Biometric & Facial Recognition
- Multi-Angle Face Enrollment: A guided step-by-step wizard captures facial embeddings across frontal and side angles to build a composite feature vector.
- Presentation Attack Detection: Real-time liveness checking protects against photo printouts, digital screens, and deepfake replay attacks.
- High-Accuracy Matching: Powered by 512-dimensional ArcFace feature vectors with customizable similarity thresholds.

### Flexible Check-In & Verification
- Geofenced Mobile Check-In: Allows field or remote employees to check in from mobile devices after validating their GPS coordinates against authorized site perimeters.
- Offline Edge Terminal Mode: Stores attendance records locally in IndexedDB when network connection drops, automatically syncing back to the server upon reconnection.
- QR Code & PIN Fallback: Time-restricted QR codes and multi-factor PIN verification provide dependable backup methods during camera maintenance or low-light conditions.

### User Roles & Custom Dashboards
- Role-Tailored Dashboards: Specific operational views designed for Super Admins, HR Managers, Department Heads / Lecturers, Security Officers, and Employees / Students.
- Granular Permissions: Role-based access control protecting system endpoints, user profiles, and administrative overrides.

### Security, Audit & Privacy
- Tamper-Evident Audit Ledger: SHA-256 cryptographic hash chains lock audit logs to detect and prevent unauthorized history modification.
- Security Telemetry: Real-time tracking of failed authentication, camera disconnects, permission violations, and suspicious spoof attempts.
- Biometric Privacy & GDPR Tools: Self-service privacy controls enabling users to view their stored biometric data, request full data exports, or permanently purge facial embeddings.

### Notifications & Communication
- Multi-Channel Dispatch: Send instant automated alerts over SMTP Email, SMS via Twilio, WhatsApp webhooks, and live WebSocket broadcasts.
- Customizable Trigger Rules: Notify HR or managers automatically on late arrivals, unexcused absences, or security flags.

### Analytics, AI & Reporting
- AI Natural Language Assistant: Query attendance data directly with natural questions such as "Who was late this morning?" or "Show attendance trends for the Engineering department."
- Automated Report Generation: Generate PDF and Excel summaries covering daily attendance, monthly summaries, and department-level stats.
- Theme Customization: Full support for both dark mode and light mode across all dashboard components.

## Tech Stack

### Backend
- FastAPI (Python async web framework)
- MySQL 8.0 & SQLAlchemy ORM
- InsightFace (ArcFace 512D embeddings) & OpenCV
- Redis & Celery (Background queue and caching)
- JWT & Bcrypt (Authentication and password security)
- Cryptographic SHA-256 audit engine

### Frontend
- React 19 & TypeScript
- Vite
- TailwindCSS & Framer Motion
- Zustand (State management)
- TanStack Query (Data fetching)
- IndexedDB (Client-side offline storage)
- Recharts (Analytics and visual charts)

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/         # FastAPI endpoints (Attendance, Privacy, Audit, Users, etc.)
│   │   ├── attendance/     # Geofencing and check-in logic
│   │   ├── audit/          # Cryptographic tamper-proof ledger
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── notifications/  # Email, SMS, WhatsApp dispatchers
│   │   ├── recognition/    # ArcFace engine and liveness detector
│   │   └── schemas/        # Pydantic validation schemas
│   └── scripts/            # Database initialization and setup tools
│
└── frontend/
    └── src/
        ├── features/       # Feature modules (face enrollment, privacy, check-in, dashboard, security)
        ├── components/     # Shared UI components
        ├── layouts/        # Application layout and navigation sidebar
        ├── routes/         # App routing definitions
        └── services/       # Offline storage and API service handlers
```
