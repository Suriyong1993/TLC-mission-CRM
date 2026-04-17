# TLC-mission CRM - Supabase Setup Guide

## 1. สร้าง Project บน Supabase

1. ไปที่ https://supabase.com/dashboard
2. คลิก "New Project"
3. ตั้งชื่อ: `tlc-mission-crm`
4. เลือก Region: `Singapore` (ใกล้ไทยที่สุด)
5. รอสักครู่ให้ database provision เสร็จ

## 2. รัน SQL Migrations

ไปที่ **SQL Editor** ใน Supabase Dashboard แล้วรันไฟล์ตามลำดับ:

### วิธีที่ 1: รันทีละไฟล์ (แนะนำ)

คัดลอกเนื้อหาจากแต่ละไฟล์ใน `supabase/migrations/` แล้วรันตามลำดับ:

1. `001_organizations_bodies.sql`
2. `002_care_groups.sql`
3. `003_members_leaders.sql`
4. `004_domain_attendance.sql`
5. `005_domain_attitude.sql`
6. `006_domain_visits.sql`
7. `007_weekly_snapshots.sql`
8. `008_meeting_reports.sql`
9. `009_alerts_view.sql`
10. `010_rls_tenant_function.sql`
11. `011_rls_policies.sql`

### วิธีที่ 2: ใช้ Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref jhibxvtialvltlsljdrq

# Push migrations
supabase db push
```

## 3. ตั้งค่า Authentication

ไปที่ **Authentication > Providers > Email** ใน Supabase Dashboard:

### 3.1 เปิดใช้งาน Email Authentication
- ✅ Enable Email provider
- ✅ Confirm email (แนะนำให้ปิดชั่วคราวระหว่างทดสอบ)
- ✅ Secure email change
- ✅ Secure password change

### 3.2 สร้าง Users 6 Bodies

ไปที่ **Authentication > Users > Add User** สร้าง 6 users:

| Email | Password | Body |
|-------|----------|------|
| `body_1@mission.local` | (ตั้งรหัส) | เมือง 1 |
| `body_2@mission.local` | (ตั้งรหัส) | เมือง 2 |
| `body_3@mission.local` | (ตั้งรหัส) | สมเด็จ |
| `body_4@mission.local` | (ตั้งรหัส) | ท่าคันโท |
| `body_5@mission.local` | (ตั้งรหัส) | กุฉินารายณ์ |
| `body_6@mission.local` | (ตั้งรหัส) | คำใหญ่ |

**หมายเหตุ:** ระบบใช้ pattern `body_X@mission.local` เพื่อระบุ Body โดยอัตโนมัติ

## 4. ตั้งค่า Environment Variables บน Vercel

ไปที่ **Project Settings > Environment Variables** ใน Vercel Dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://jhibxvtialvltlsljdrq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_iqHPcL5S5EYGr-yJll9dqQ_qO84jd94
SUPABASE_SERVICE_ROLE_KEY=(ดจาก Supabase Dashboard > Project Settings > API)
```

## 5. สร้าง Storage Buckets (ถ้าต้องการ)

ไปที่ **Storage > New Bucket**:

1. `avatars` - สำหรับรูปโปรไฟล์
2. `groups` - สำหรับรูปกลุ่มแคร์
3. `reports` - สำหรับรายงาน PDF

## 6. ทดสอบการทำงาน

1. Deploy เสร็จแล้ว เปิด URL ที่ Vercel ให้มา
2. ทดสอบ Login ด้วย `body_1@mission.local`
3. ตรวจสอบว่า Dashboard แสดงข้อมูล Body "เมือง 1"
4. ทดสอบระบบ Entry ต่างๆ

## 7. โครงสร้าง Database

### Tables หลัก:
- `organizations` - องค์กร (SUKHSAN)
- `bodies` - 6 หน่วยงานย่อย
- `care_groups` - กลุ่มแคร์ G01-G20
- `members` - สมาชิก
- `leaders` - ผู้นำกลุ่ม
- `domain_attendance` - Domain 1: การเข้าร่วม
- `domain_attitude` - Domain 2: ทัศนคติ
- `domain_visits` - Domain 3: การเยี่ยม
- `weekly_pillars` - สถิติ 8 เสา
- `weekly_makj` - สถิติ มาคจ/มาแคร์

### Security:
- **RLS (Row Level Security)** - แยกข้อมูลตาม Body
- **Function** `current_tenant_body_id()` - ระบุ Body จาก email

## 8. ปัญหาที่พบบ่อย

### Q: ไม่สามารถ login ได้?
A: ตรวจสอบว่า:
1. Environment variables ตั้งค่าถูกต้อง
2. User ถูกสร้างใน Supabase Auth
3. Email pattern ถูกต้อง (`body_X@mission.local`)

### Q: ไม่เห็นข้อมูล?
A: ตรวจสอบว่า:
1. SQL migrations รันครบทุกไฟล์
2. Seed data ถูก insert (bodies, care_groups)
3. RLS policies ทำงานถูกต้อง

### Q: จะเพิ่มกลุ่มแคร์เพิ่ม?
A: แก้ไขตรงๆ ใน `care_groups` table ผ่าน Supabase Dashboard หรือ SQL

---

**สำหรับคำถามเพิ่มเติม:** ดูที่ `CLAUDE.md` ใน repository
