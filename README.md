# Facial Recognition Attendance System

A biometric attendance system that uses facial recognition to automate employee attendance tracking. Built for organizations looking to replace traditional punch cards or manual check-ins with something more secure and efficient.

## What It Does

This project is designed to help organizations track employee attendance automatically using facial recognition cameras. When someone walks in, the system recognizes their face, logs their attendance, and can even detect if someone's trying to fool it with a photo or video.

Beyond just tracking attendance, it handles visitor registration, leave requests, department management, and generates reports. Everything updates in real-time through WebSocket connections, so admins can see attendance updates as they happen.

## Built With

### Backend Stack
- **FastAPI** - Modern Python web framework, chosen for its async capabilities and automatic API documentation
- **MySQL 8.0** - Relational database with SQLAlchemy ORM for handling all the attendance records and user data
- **InsightFace** - The core facial recognition engine using ArcFace embeddings (512-dimensional vectors for each face)
- **OpenCV** - Image processing and computer vision operations
- **Redis & Celery** - For caching and handling background tasks like report generation
- **JWT & Bcrypt** - Secure authentication with token-based auth and password hashing
- **Docker** - Containerization for easier deployment

### Frontend Stack
- **React 19** with **TypeScript** - Type-safe component architecture
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS for consistent styling
- **Zustand** - Lightweight state management (simpler than Redux)
- **TanStack Query** - Server state management and caching
- **React Hook Form + Zod** - Form handling with schema validation
- **Recharts** - For analytics dashboards and charts
- **Framer Motion** - Smooth animations throughout the UI
- **React Webcam** - Capturing images for face enrollment

## Main Features

**Facial Recognition**
- Uses 512-dimensional ArcFace embeddings for accurate face matching
- Includes liveness detection to prevent spoofing with photos or videos
- Configurable similarity threshold for matching

**User Roles & Permissions**
- Multiple role types: Admin, HR, Manager, Employee, Security, and Visitor
- Each role has specific permissions (managed through RBAC middleware)
- HR can manually override attendance records when needed

**Attendance Tracking**
- Automatic clock-in/clock-out when faces are recognized
- Real-time WebSocket updates for live attendance monitoring
- Tracks late arrivals, early departures, and absences
- Export attendance data to Excel or PDF

**Camera Management**
- Support for multiple RTSP cameras
- Health monitoring for each camera feed
- Logs unknown faces for security review

**Department & Leave Management**
- Organize employees by department and hierarchy
- Submit and approve leave requests
- Leave balance tracking

**Analytics & Reporting**
- Dashboard with attendance trends and statistics
- Downloadable reports in multiple formats
- Audit logs for tracking system activity

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
