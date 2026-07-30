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

## Advanced Enterprise Features

**AI Assistant**
The system includes a natural language assistant that lets you query attendance data conversationally. Instead of navigating through dashboards, just ask questions like "who was late today?" or "show me absences this week" and get instant answers. It understands context and can answer questions about late arrivals, absences, camera accuracy, department statistics, recognition failures, and attendance trends.

**QR Code Backup Attendance**
Sometimes facial recognition isn't practical, like when someone's face is covered or cameras are temporarily offline. The QR backup system generates time-limited QR codes (valid for 5 minutes) that employees can scan to log attendance manually. Every QR-based attendance entry is flagged as a fallback and includes the reason, so you maintain visibility into when and why the backup method was used.

**Multi-Factor Attendance Verification**
For high-security environments, single-factor attendance might not be enough. The multi-factor system lets you combine multiple verification methods: facial recognition, geofence validation (is the person actually at the office?), device fingerprinting, QR codes, and PIN codes. You can configure policies per department or employee category, like requiring both face and location for remote workers.

**Security Center**
A centralized monitoring dashboard that tracks all security-relevant events in real-time. It logs authentication attempts, permission denials, unusual patterns, failed recognition attempts, and API access. Events are categorized by severity (critical, high, medium, low), and you can review active sessions, recent alerts, and access patterns. Everything is timestamped and includes context like IP addresses and user agents.

**AI-Powered Reports**
Reports go beyond raw data and numbers. The AI report generator creates narrative summaries that explain what the data means. Generate monthly overviews, weekly summaries, department-specific reports, or employee performance analyses. Each report includes contextual insights, trend analysis, and highlights patterns that might need attention, like consistently late employees or departments with declining attendance rates.

**System Health Dashboard**
Monitor the infrastructure in real-time. Track CPU usage, memory consumption, disk space, and network latency across all components. View the status of each service (database, cache, recognition engine, cameras) and get alerts when something goes wrong. The dashboard shows component uptime, recent failures, and performance metrics, helping you catch issues before they affect users.

**Comprehensive Audit Trail**
Every action in the system is logged with full context. Track who did what, when they did it, and from where (IP address and user agent). Filter logs by user, action type, date range, or IP address. Export audit logs for compliance reviews or security investigations. The system also provides statistics on the most active users and most frequent actions.

**API Integration Framework**
Connect the attendance system with your existing enterprise tools. The integration framework supports HR systems, payroll platforms, email services, SMS gateways, and custom webhooks. Each integration can be tested independently, synced on-demand, and monitored for errors. This means attendance data can automatically flow into payroll systems, or trigger email notifications when someone's absent.

**Progressive Web App (PWA)**
The frontend works as a progressive web app, which means it can be installed on desktop or mobile devices and works offline. When the network is unavailable, the app caches essential data and queues actions for later. It also supports push notifications for real-time alerts and background sync to ensure no data is lost during connectivity issues.

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
