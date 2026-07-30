# How to Run the Facial Recognition Attendance System

This document contains step-by-step instructions to run both the **Backend** (Python FastAPI + MySQL) and the **Frontend** (React 19 + Vite).

---

## 1. How to Run the Backend

### Prerequisites
- Python 3.10 or higher
- MySQL Server 8.0 running on `localhost:3306` with password ``

---

### Step-by-Step Instructions:

#### Step 1: Open a Terminal / PowerShell window
Navigate to the `backend` folder:
```powershell
cd "c:\Users\ADMIN\OneDrive\Desktop\Facial recognition attendance system\backend"
```

#### Step 2: Install Required Python Packages
```powershell
pip install -r requirements.txt
```

#### Step 3: Create & Seed the MySQL Database
Run the automated setup script to create the `facial_recognition_database` database, 44 tables, and initial seed data:
```powershell
python scripts/setup_mysql_database.py
```

#### Step 4: Start the Backend Web Server
Run Uvicorn to launch the FastAPI server:
```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Step 5: Verify the Backend is Running
Open your web browser and go to:
- **Interactive API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 2. How to Run the Frontend

#### Step 1: Open a new Terminal / PowerShell window
Navigate to the `frontend` folder:
```powershell
cd "c:\Users\ADMIN\OneDrive\Desktop\Facial recognition attendance system\frontend"
```

#### Step 2: Install Node Dependencies (if needed)
```powershell
npm install
```

#### Step 3: Start the Vite Development Server
```powershell
npm run dev
```

#### Step 4: Open in Web Browser
Navigate to:
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)

---

## 3. Quick One-Click Windows Batch Startup

You can also use the included batch files at the root directory:

- **Start Backend**: Double-click `start_backend.bat`
- **Start Frontend**: Double-click `start_frontend.bat`
