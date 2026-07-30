# Facial Recognition Attendance System

Automate employee attendance tracking using facial recognition. Replaces traditional punch cards with secure biometric verification.

## What It Does

Track employee attendance automatically with facial recognition cameras. The system recognizes faces, logs attendance, and detects spoofing attempts using liveness detection.

Handles visitor registration, leave requests, department management, and report generation. Real-time updates via WebSocket connections.

## Built With

### Backend Stack
- **FastAPI** - Async Python web framework with automatic API docs
- **MySQL 8.0** - Database with SQLAlchemy ORM
- **InsightFace** - Face recognition using ArcFace embeddings (512-dimensional vectors)
- **OpenCV** - Image processing and computer vision
- **Redis & Celery** - Caching and background task processing
- **JWT & Bcrypt** - Token authentication and password hashing
- **Docker** - Containerization

### Frontend Stack
- **React 19** with **TypeScript** - Type-safe components
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state and caching
- **React Hook Form + Zod** - Form validation
- **Recharts** - Analytics charts
- **Framer Motion** - UI animations
- **React Webcam** - Face enrollment capture

## Main Features

**Facial Recognition**
- 512-dimensional ArcFace embeddings for accurate matching
- Liveness detection prevents photo/video spoofing
- Configurable similarity threshold

**User Roles & Permissions**
- Six role types: Admin, HR, Manager, Employee, Security, Visitor
- Role-based access control on all endpoints
- Manual attendance override capability for HR

**Attendance Tracking**
- Automatic clock-in/clock-out on face detection
- Real-time WebSocket updates
- Late arrivals, early departures, and absence tracking
- Excel and PDF export

**Camera Management**
- Multiple RTSP camera support
- Health monitoring per camera
- Unknown face logging

**Department & Leave Management**
- Department hierarchy organization
- Leave request submission and approval
- Leave balance tracking

**Analytics & Reporting**
- Attendance trends dashboard
- Multiple export formats
- System activity audit logs

## Advanced Enterprise Features

**AI Assistant**
Query attendance data using natural language. Ask "who was late today?" or "show me absences this week" for instant answers. Supports queries about late arrivals, absences, camera accuracy, departments, recognition failures, and trends.

**QR Code Backup Attendance**
Fallback method when facial recognition isn't practical. Generates time-limited QR codes valid for 5 minutes. All QR-based entries are flagged with the reason for using backup method.

**Multi-Factor Attendance Verification**
Combines multiple verification methods: facial recognition, geofence validation, device fingerprinting, QR codes, and PIN codes. Configure policies per department or employee category.

**Security Center**
Centralized monitoring for security events. Tracks authentication attempts, permission denials, unusual patterns, failed recognitions, and API access. Events categorized by severity with IP and user agent context.

**AI-Powered Reports**
Generates narrative summaries with contextual insights. Creates monthly overviews, weekly summaries, department reports, and performance analyses. Highlights patterns like consistently late employees or declining attendance rates.

**System Health Dashboard**
Real-time infrastructure monitoring. Tracks CPU, memory, disk space, and network latency. Shows service status for database, cache, recognition engine, and cameras. Alerts on failures with performance metrics.

**Comprehensive Audit Trail**
Logs every action with full context: user, action, timestamp, IP address, and user agent. Filter by user, action type, date range, or IP. Export for compliance reviews with statistics on active users and frequent actions.

**API Integration Framework**
Connects with HR systems, payroll platforms, email services, SMS gateways, and webhooks. Test integrations independently, sync on-demand, and monitor for errors. Automates data flow to enterprise tools.

**Progressive Web App (PWA)**
Installable on desktop and mobile. Works offline with cached data and queued actions. Supports push notifications and background sync for connectivity issues.

## How It Works

The system has three main parts:

1. **Recognition Engine** - When a frame comes in from a camera, it detects faces, extracts facial features into a 512-dimensional vector, and compares it against enrolled faces in the database. If there's a match above the threshold, it logs the attendance.

2. **Backend API** - FastAPI serves all the endpoints for user management, attendance records, reports, etc. It's fully async, so it can handle multiple camera feeds and API requests simultaneously without blocking.

3. **Frontend Dashboard** - React-based admin interface where HR and managers can view attendance, manage employees, approve leave requests, and generate reports. Updates happen in real-time via WebSocket connections.

## Security

- All passwords are hashed using bcrypt before storage
- JWT tokens for session management (no server-side session storage)
- Role-based access control on every endpoint
- Rate limiting to prevent API abuse
- Input validation using Pydantic schemas to prevent injection attacks
- CORS configured to only allow requests from the frontend domain

## Project Structure

```
├── backend/          # FastAPI application
│   ├── app/
│   │   ├── api/v1/   # API endpoints
│   │   ├── models/   # Database models
│   │   ├── schemas/  # Pydantic schemas
│   │   └── recognition/ # Face recognition engine
│   └── scripts/      # Database setup scripts
│
└── frontend/         # React application
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── hooks/
    └── public/
```

## License

All rights reserved.
