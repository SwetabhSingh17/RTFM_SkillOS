@echo off
echo =========================================
echo       RTFM_SkillOS - Setup and Start
echo =========================================

echo.
echo [1/2] Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo [2/2] Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo.
echo Starting servers in new windows...
start cmd /k "title RTFM_SkillOS Backend && cd server && npm run dev"
start cmd /k "title RTFM_SkillOS Frontend && cd client && npm run dev"

echo Done! The servers are now running.
pause
