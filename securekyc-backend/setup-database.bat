@echo off
setlocal

REM Set DB_USERNAME and DB_PASSWORD in your shell before using this script.
if "%DB_PASSWORD%"=="" (
    echo ERROR: DB_PASSWORD must be set.
    exit /b 1
)

if "%DB_USERNAME%"=="" set DB_USERNAME=root

cd /d "%~dp0"
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u%DB_USERNAME% -p%DB_PASSWORD% < database-schema-mysql.sql
if errorlevel 1 exit /b 1

echo SecureKYC database schema is ready.
