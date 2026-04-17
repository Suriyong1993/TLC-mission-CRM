# TLC-mission CRM - คู่มือ Deploy ฉบับสมบูรณ์

## 🚀 ขั้นตอนที่ 1: Deploy บน Vercel (ใช้เวลา ~3 นาที)

### 1.1 ไปที่ Vercel
- เปิด https://vercel.com/new
- คลิก "Import Git Repository"

### 1.2 ตั้งค่า Project
```
Git Repository: Suriyong1993/TLC-mission-CRM
Branch: master
Framework Preset: Next.js
Root Directory: oikos-mission    ← สำคัญมาก!
```

### 1.3 เพิ่ม Environment Variables
คลิก "Environment Variables" แล้วเพิ่ม:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jhibxvtialvltlsljdrq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_iqHPcL5S5EYGr-yJll9dqQ_qO84jd94` |

### 1.4 Deploy
- กด "Deploy" 
- รอ ~2-3 นาที ให้ build เสร็จ
- จะได้ URL แบบนี้: `https://tlc-mission-crm-xxx.vercel.app`

---

## 🗄️ ขั้นตอนที่ 2: ตั้งค่า Supabase Database (ใช้เวลา ~5 นาที)

### 2.1 เปิด Supabase Dashboard
- ไปที่ https://supabase.com/dashboard/project/jhibxvtialvltlsljdrq

### 2.2 รัน SQL Schema (วิธีที่ 1 - รันไฟล์เดียว)
1. ไปที่ **SQL Editor** (แท็บซ้าย)
2. คลิก **New Query**
3. เปิดไฟล์ `999_combined_all.sql` จาก GitHub:
   - https://raw.githubusercontent.com/Suriyong1993/TLC-mission-CRM/master/supabase/migrations/999_combined_all.sql
4. คัดลอกทั้งหมด วางใน SQL Editor
5. กด **Run** ▶️

✅ ถ้าขึ้น "Success" = สำเร็จ!

### 2.3 ตรวจสอบว่าข้อมูลถูกต้อง
ไปที่ **Table Editor** แล้วตรวจสอบ:
- `bodies` table ต้องมี 6 แถว (เมือง 1, เมือง 2, สมเด็จ, ท่าคันโท, กุฉินารายณ์, คำใหญ่)
- `care_groups` table ต้องมี 20 แถว (G01-G20)

---

## 👤 ขั้นตอนที่ 3: สร้าง Users สำหรับ Login (ใช้เวลา ~3 นาที)

### 3.1 ไปที่ Authentication
- ไปที่ **Authentication > Users** (แท็บซ้าย)
- คลิก **Add User** สร้างทีละคน

### 3.2 สร้าง 6 Users (กำหนด password เอง)

| ลำดับ | Email | Body | รหัสผ่าน (ตั้งเอง) |
|-------|-------|------|------------------|
| 1 | `body_1@mission.local` | เมือง 1 | (ตั้งรหัส) |
| 2 | `body_2@mission.local` | เมือง 2 | (ตั้งรหัส) |
| 3 | `body_3@mission.local` | สมเด็จ | (ตั้งรหัส) |
| 4 | `body_4@mission.local` | ท่าคันโท | (ตั้งรหัส) |
| 5 | `body_5@mission.local` | กุฉินารายณ์ | (ตั้งรหัส) |
| 6 | `body_6@mission.local` | คำใหญ่ | (ตั้งรหัส) |

⚠️ **สำคัญ**: Email ต้องเป็น pattern `body_X@mission.local` เท่านั้น!

### 3.3 ปิด Email Confirmation (ชั่วคราว)
ไปที่ **Authentication > Providers > Email**:
- ❌ ปิด "Confirm email" (ระหว่างทดสอบ)
- เปิดอีกครั้งเมื่อใช้งานจริง

---

## ✅ ขั้นตอนที่ 4: ทดสอบระบบ (ใช้เวลา ~2 นาที)

### 4.1 ทดสอบ Login
1. เปิด URL จาก Vercel (ขั้นตอนที่ 1)
2. กรอก Email: `body_1@mission.local`
3. กรอก Password ที่ตั้งไว้
4. กด Login

### 4.2 ตรวจสอบว่าเห็น Body ถูกต้อง
- ถ้า login ด้วย `body_1@mission.local` ต้องเห็น "เมือง 1"
- ถ้า login ด้วย `body_2@mission.local` ต้องเห็น "เมือง 2"
- ถ้าเห็นถูกต้อง = ✅ RLS ทำงานถูกต้อง

### 4.3 ทดสอบฟังก์ชั่นต่างๆ
- เข้า **Entry** → **Weekly Pillars** → บันทึกตัวเลข
- เข้า **Groups** → ต้องเห็นกลุ่มของ Body ตัวเอง
- เข้า **Trends** → ดูกราฟ

---

## 🔧 การแก้ปัญหาเบื้องต้น

### ❌ Build Failed บน Vercel
**สาเหตุ**: ส่วนใหญ่เกิดจากตั้งค่า Root Directory ผิด
**แก้ไข**: 
1. ไปที่ Vercel Project → Settings
2. แก้ Root Directory เป็น `oikos-mission`
3. Redeploy

### ❌ Login ไม่ได้
**ตรวจสอบ**:
1. Environment Variables ตั้งค่าถูกไหม?
2. User สร้างใน Supabase แล้วหรือยัง?
3. Email pattern ถูกต้องไหม? (ต้องเป็น `body_X@mission.local`)

### ❌ เข้าแล้วไม่เห็นข้อมูล
**ตรวจสอบ**:
1. SQL migrations รันครบทุกไฟล์หรือยัง?
2. ลองรัน `999_combined_all.sql` อีกครั้ง
3. ตรวจสอบใน Supabase Table Editor ว่ามีข้อมูลใน `bodies` และ `care_groups`

### ❌ เห็นข้อมูล Body ผิด
**สาเหตุ**: RLS function ไม่ทำงาน
**แก้ไข**: 
1. ตรวจสอบว่ารัน `010_rls_tenant_function.sql` แล้ว
2. ตรวจสอบว่ารัน `011_rls_policies.sql` แล้ว
3. ตรวจสอบว่า email user ตรงกับ `body.code` ในตาราง

---

## 📱 สรุป Quick Commands

### ถ้าใช้ Supabase CLI:
```bash
# Login
supabase login

# Link project
supabase link --project-ref jhibxvtialvltlsljdrq

# Push migrations
supabase db push
```

### ถ้าต้องการ Reset Database:
```sql
-- ระวัง! ลบข้อมูลทั้งหมด
DROP TABLE IF EXISTS domain_attendance, domain_attitude, domain_visits, 
weekly_pillars, weekly_makj, meeting_reports, alerts, 
members, leaders, care_groups, bodies, organizations CASCADE;

-- แล้วรัน migrations ใหม่
```

---

## 🎉 เมื่อเสร็จสิ้น

ระบบ TLC-mission CRM พร้อมใช้งานแล้ว!

**URL ใช้งาน**: [URL จาก Vercel]

**Users สำหรับทดสอบ**:
- 6 Bodies พร้อมใช้งาน
- 20 กลุ่มแคร์ (G01-G20)
- 3 Domains (Attendance, Attitude, Visit)
- 8 Pillars + MAKJ รายงาน

**ติดต่อสนับสนุน**: ดูเอกสารเพิ่มเติมใน `CLAUDE.md`
