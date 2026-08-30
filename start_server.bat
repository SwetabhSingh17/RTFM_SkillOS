@echo off
setlocal EnableDelayedExpansion

title RTFM SkillOS Setup & Launcher

echo ========================================================
echo   🚀 RTFM SkillOS - Automated Setup ^& Start Script 🚀
echo ========================================================
echo.

:: 1. Check for Node.js
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] Node.js not found. Installing Node.js...
    winget install OpenJS.NodeJS -e --accept-source-agreements --accept-package-agreements
    echo [INFO] Node.js installed. We need to restart the script to refresh system paths.
    echo Please close this window and double-click "start_server.bat" again!
    pause
    exit /b
) ELSE (
    echo [OK] Node.js is installed.
)

:: 2. Check for PostgreSQL
set PSQL_CMD=psql
psql -V >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    :: Try to find it in common directories if not in PATH
    FOR /D %%G IN ("C:\Program Files\PostgreSQL\*") DO (
        IF EXIST "%%G\bin\psql.exe" (
            set PSQL_CMD="%%G\bin\psql.exe"
        )
    )
)

!PSQL_CMD! -V >nul 2>&1
IF !ERRORLEVEL! NEQ 0 (
    echo [INFO] PostgreSQL not found. Installing PostgreSQL silently...
    echo [INFO] (A window might pop up asking for Admin permission. Please click Yes).
    echo [INFO] The default database password will be set to: postgres
    winget install PostgreSQL.PostgreSQL -e --override "--mode unattended --superpassword postgres --serverport 5432" --accept-source-agreements --accept-package-agreements
    
    :: Add to path for this session
    FOR /D %%G IN ("C:\Program Files\PostgreSQL\*") DO (
        IF EXIST "%%G\bin\psql.exe" (
            set PSQL_CMD="%%G\bin\psql.exe"
            set PATH=!PATH!;%%G\bin
        )
    )
    echo [INFO] PostgreSQL installation complete.
) ELSE (
    echo [OK] PostgreSQL is installed.
)

:: Wait a few seconds for postgres service to be fully ready
timeout /t 3 /nobreak >nul

:: 3. Create database (Set PGPASSWORD to prevent hanging if password is required)
set PGPASSWORD=postgres
echo.
echo [INFO] Setting up database...
!PSQL_CMD! -U postgres -c "CREATE DATABASE skillos;" >nul 2>&1
IF !ERRORLEVEL! EQU 0 (
    echo [OK] Created 'skillos' database!
) ELSE (
    echo [INFO] 'skillos' database might already exist, or connection failed. (Usually this is completely fine).
)

:: 4. Create .env files
echo.
echo [INFO] Setting up configuration files...
IF NOT EXIST "server\.env" (
    IF EXIST "server\.env.example" (
        copy "server\.env.example" "server\.env" >nul
        echo [OK] Created server\.env
    )
) ELSE (
    echo [OK] server\.env already exists.
)

IF NOT EXIST ".env" (
    IF EXIST ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Created root .env
    )
) ELSE (
    echo [OK] root .env already exists.
)

:: 5. Install Dependencies & Setup Schema
echo.
echo [INFO] Installing packages for the main folder...
call npm install >nul 2>&1

echo [INFO] Installing packages for the Backend (Server)...
cd server
call npm install >nul 2>&1

echo [INFO] Updating database schema...
call npx drizzle-kit push >nul 2>&1

echo [INFO] Adding demo users to the database...
call npm run seed >nul 2>&1

cd ..

echo [INFO] Installing packages for the Frontend (Client)...
cd client
call npm install >nul 2>&1
cd ..

:: 6. Start Servers
echo.
echo ==============================================================
echo   🎉 ALL SET BY SWETABH.! I WILL BE STARTING SERVERS NOW...
echo ==============================================================
echo [INFO] Opening a new window for the Backend server...
start "RTFM SkillOS - Backend" cmd /c "title Backend Server && cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo [INFO] Opening a new window for the Frontend server...
start "RTFM SkillOS - Frontend" cmd /c "title Frontend Server && cd client && npm run dev"

echo.
echo [SUCCESS] The application is starting up! 
echo.
echo ⚠️ PLEASE KEEP THE TWO NEW BLACK WINDOWS OPEN! ⚠️
echo Closing them will shut down the servers.
echo.
echo The app should open in your browser shortly at http://localhost:5173
echo You can log in with:
echo   Username: admin
echo   Password: admin123
echo.
echo If it doesn't open automatically, just type http://localhost:5173 in your browser.
echo.
pause
