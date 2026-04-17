@echo off
REM TLC-mission CRM Deployment Script for Windows
REM Usage: deploy.bat [preview|production]

setlocal enabledelayedexpansion

set ENV=%1
if "%ENV%"=="" set ENV=preview

echo 🌊 TLC-mission CRM Deployment
echo Environment: %ENV%
echo.

REM Check for required env vars
if "%NEXT_PUBLIC_SUPABASE_URL%"=="" (
  echo ❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set
  exit /b 1
)

if "%NEXT_PUBLIC_SUPABASE_ANON_KEY%"=="" (
  echo ❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set
  exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci
if errorlevel 1 exit /b 1

REM Type check
echo 🔍 Running type check...
call npm run type-check
if errorlevel 1 exit /b 1

REM Build
echo 🏗️ Building...
call npm run build
if errorlevel 1 exit /b 1

REM Deploy to Vercel
echo 🚀 Deploying to Vercel (%ENV%)...
if "%ENV%"=="production" (
  call vercel --prod
) else (
  call vercel
)
if errorlevel 1 exit /b 1

echo.
echo ✅ Deployment complete!
echo.
echo Next steps:
echo 1. Run database migrations if needed
echo 2. Verify environment variables
echo 3. Test the deployment

endlocal
