@echo off
setlocal

REM Configure these values in your shell or IDE before running this script.
if "%JWT_SECRET%"=="" (
    echo ERROR: JWT_SECRET must be set and contain at least 32 characters.
    exit /b 1
)

if "%DB_PASSWORD%"=="" (
    echo ERROR: DB_PASSWORD must be set.
    exit /b 1
)

cd /d "%~dp0"
echo Starting SecureKYC backend on port 8081...
call mvnw.cmd spring-boot:run
