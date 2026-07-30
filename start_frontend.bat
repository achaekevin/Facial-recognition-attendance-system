@echo off
title Starting BioAuth React Frontend
echo ========================================================
echo Starting Facial Recognition Attendance System Frontend
echo ========================================================
cd /d "%~dp0frontend"
echo Starting Vite Dev Server on http://localhost:3000...
npm run dev
pause
