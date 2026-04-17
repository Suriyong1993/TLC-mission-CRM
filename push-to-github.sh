#!/bin/bash

# TLC-mission CRM - Push to GitHub Script
# วิธีใช้: ./push-to-github.sh your-repo-name

REPO_NAME=${1:-"tlc-mission-crm"}

echo "🌊 TLC-mission CRM - Push to GitHub"
echo "===================================="
echo ""

# ตรวจสอบว่ามี git หรือไม่
if ! command -v git &> /dev/null; then
    echo "❌ Git ไม่ได้ติดตั้ง"
    exit 1
fi

# ตรวจสอบว่ามี gh CLI หรือไม่
if ! command -v gh &> /dev/null; then
    echo "⚠️  แนะนำให้ติดตั้ง GitHub CLI (gh) ก่อน:"
    echo "   https://cli.github.com/"
    echo ""
    echo "หรือสร้าง repo ด้วยตนเองที่: https://github.com/new"
    exit 1
fi

# ตรวจสอบว่า login แล้วหรือยัง
if ! gh auth status &> /dev/null; then
    echo "🔐 กรุณา login GitHub CLI ก่อน:"
    echo "   gh auth login"
    exit 1
fi

# สร้าง repository บน GitHub
echo "📦 สร้าง GitHub repository: $REPO_NAME"
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push สำเร็จ!"
    echo ""
    echo "URL: https://github.com/$(gh api user -q .login)/$REPO_NAME"
    echo ""
    echo "ขั้นตอนต่อไป:"
    echo "1. ไปที่ Vercel: https://vercel.com/new"
    echo "2. Import project จาก GitHub"
    echo "3. ตั้งค่า Environment Variables"
else
    echo ""
    echo "❌ เกิดข้อผิดพลาด"
    echo ""
    echo "ลองสร้าง repo ด้วยตนเองที่: https://github.com/new"
    echo "แล้วรันคำสั่ง:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
    echo "   git push -u origin main"
fi
