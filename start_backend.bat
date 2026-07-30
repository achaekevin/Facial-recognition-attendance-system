@echo off
title Starting BioAuth FastAPI Backend
echo ========================================================
echo Starting Facial Recognition Attendance System Backend
echo ========================================================
cd /d "%~dp0backend"
echo Installing missing python dependencies...
python -m pip install -r requirements.txt
echo.
echo Initializing MySQL Database (facial_recognition_database)...
python scripts/setup_mysql_database.py
echo.
echo Launching Uvicorn FastAPI Server on http://localhost:8000...
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
pause
