@echo off
REM TLC-mission CRM - Push to GitHub Script for Windows
REM วิธีใช้: push-to-github.bat your-repo-name

setlocal enabledelayedexpansion

set REPO_NAME=%1
if "%REPO_NAME%"=="" set REPO_NAME=tlc-mission-crm

echo 🌊 TLC-mission CRM - Push to GitHub
echo ====================================
echo.

REM ตรวจสอบว่ามี git หรือไม่
git --version >nul 2>&1
if errorlevel 1 (
  echo ❌ Git ไม่ได้ติดตั้ง
  echo ดาวน์โหลดได้ที่: https://git-scm.com/download/win
  exit /b 1
)

REM ตรวจสอบว่ามี gh CLI หรือไม่
gh --version >nul 2>&1
if errorlevel 1 (
  echo ⚠️  แนะนำให้ติดตั้ง GitHub CLI ^(gh^) ก่อน:
  echo    https://cli.github.com/
  echo.
  echo หรือสร้าง repo ด้วยตนเองที่: https://github.com/new
  exit /b 1
)

REM ตรวจสอบว่า login แล้วหรือยัง
gh auth status >nul 2>&1
if errorlevel 1 (
  echo 🔐 กรุณา login GitHub CLI ก่อน:
  echo    gh auth login
  exit /b 1
)

REM สร้าง repository บน GitHub
echo 📦 สร้าง GitHub repository: %REPO_NAME%
gh repo create "%REPO_NAME%" --public --source=. --remote=origin --push

if errorlevel 1 (
  echo.
  echo ❌ เกิดข้อผิดพลาด
  echo.
  echo ลองสร้าง repo ด้วยตนเองที่: https://github.com/new
  echo แล้วรันคำสั่ง:
  echo    git remote add origin https://github.com/YOUR_USERNAME/%REPO_NAME%.git
  echo    git push -u origin main
  exit /b 1
)

echo.
echo ✅ Push สำเร็จ!
echo.

for /f "tokens=*" %%a in ('gh api user -q .login') do set USERNAME=%%a
echo URL: https://github.com/%USERNAME%/%REPO_NAME%
echo.
echo ขั้นตอนต่อไป:
echo 1. ไปที่ Vercel: https://vercel.com/new
echo 2. Import project จาก GitHub
echo 3. ตั้งค่า Environment Variables

endlocal
