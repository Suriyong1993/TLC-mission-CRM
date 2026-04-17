# 🌊 TLC-mission CRM

ระบบติดตามพันธกิจคริสตจักรแบบครบวงจร สำหรับทีมพันธกิจกาฬสินธุ์

**Tagline:** "ซับซ้อนข้างใน เรียบง่ายข้างนอก" — ระบบนี้ช่วยทีมพันธกิจ ลดเวลาจาก 3 ชั่วโมง เหลือ 3 นาที 🙏

## 🚀 Quick Start

### 1. สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) แล้วสร้าง project ใหม่
2. ไปที่ SQL Editor → New query
3. คัดลอกไฟล์จาก `supabase/migrations/000_run_all.sql` และรัน
4. หรือรันทีละไฟล์ตามลำดับ 001-011

### 2. Deploy บน Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

หรือ deploy ผ่าน CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. ตั้งค่า Environment Variables

ใน Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. ตั้งค่า Supabase Auth

1. ไปที่ Authentication → Providers → Email
2. เปิดใช้งาน "Email Provider"
3. สร้าง users ตามรูปแบบ:
   - `body_1@mission.local` → เมือง 1
   - `body_2@mission.local` → เมือง 2
   - `body_3@mission.local` → สมเด็จ
   - `body_4@mission.local` → ท่าคันโท
   - `body_5@mission.local` → กุฉินารายณ์
   - `body_6@mission.local` → คำใหญ่
   - `admin@mission.local` → Admin (ดูทุก Body)

### 5. ตั้งค่า Supabase Storage

สร้าง 3 buckets:
- `avatars` (public)
- `groups` (public)
- `reports` (private, signed URLs)

## 🗄️ Database Schema

### 4 Architectural Decisions (LOCKED)

1. **Groups are Fully Dynamic** — ไม่ hardcode G01-G20
2. **Body = Current Tenant** — RLS ผ่าน `current_tenant_body_id()`
3. **Weekly Data = Immutable Snapshots** — ไม่ update, แต่ insert ใหม่
4. **Three Separated Domains** — Attendance/Attitude/Visit แยกกันเสมอ

### Core Tables

| Table | Description |
|-------|-------------|
| `organizations` | องค์กรหลัก (future-ready) |
| `bodies` | 6 Body Network |
| `care_groups` | กลุ่มแคร์ (G01-G20) - dynamic |
| `members` | สมาชิก 165+ คน |
| `leaders` | Leadership pipeline |
| `meetings` | การประชุมแต่ละครั้ง |
| `attendance_records` | เช็คชื่อ (Domain 1) |
| `attitude_assessments` | ท่าที (Domain 2) |
| `visit_records` | การเยี่ยม (Domain 3) |
| `pillar_snapshots` | 8 เสาหลักรายสัปดาห์ |
| `group_makj_snapshots` | มาคจ. รายกลุ่ม |
| `meeting_reports` | รายงานประชุม |
| `current_alerts` | View สมาชิกที่ต้องดูแล |

## 🎨 Design System

**Deep Ocean Glass** — สมุดบันีกอัจฉริยะที่รู้จักทีมของคุณ

- **Background:** `#050d1a` (night sky)
- **Cards:** `rgba(10, 22, 40, 0.75)` + blur(20px)
- **Typography:** Kanit (display) + Sarabun (body)
- **6 Body Colors:** Blue, Cyan, Purple, Green, Amber, Pink
- **8 Pillar Colors:** Orange, Blue, Green, Purple, Pink, Teal, Amber, Red

## 📁 Project Structure

```
oikos-mission/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/login/page.tsx
│   │   ├── (app)/
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── layout.tsx      # Sidebar + tabs
│   │   │   ├── entry/
│   │   │   ├── groups/
│   │   │   ├── members/
│   │   │   ├── leaderboard/
│   │   │   ├── leaders/
│   │   │   ├── trends/
│   │   │   ├── prayer-school/
│   │   │   └── care/
│   │   └── api/                # API routes
│   ├── components/             # Reusable components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   └── utils.ts
│   └── types/
├── supabase/
│   └── migrations/             # SQL migrations 001-011
├── public/
└── package.json
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run dev server (with Turbo)
npm run dev

# Type checking
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

## 📱 16 Pages (Complete UI)

1. ✅ `/login` — Login with body selector
2. ✅ `/` — Dashboard (8 pillars, hero stats)
3. ✅ `/entry/weekly-pillars` — กรอก 8 เสา
4. ✅ `/entry/weekly-makj` — กรอก มาคจ. 20 กลุ่ม
5. ✅ `/entry/attendance/[groupId]` — เช็คชื่อ
6. ✅ `/groups` — รายการกลุ่ม
7. ⏳ `/groups/[id]/report/new` — 5-step wizard
8. ⏳ `/reports/[id]` — LINE-ready report
9. ✅ `/members` — รายการสมาชิก
10. ✅ `/members/[id]` — โปรไฟล์ (3 tabs)
11. ✅ `/leaderboard` — อันดับกลุ่ม
12. ✅ `/leaders` — Leadership pipeline
13. ✅ `/trends` — แนวโน้ม 12 สัปดาห์
14. ✅ `/prayer-school` — อธิษฐาน + พพช.
15. ⏳ `/care` — Care Intelligence
16. ⏳ AI Chat Widget — FAB

## 🔐 Security

- Row Level Security (RLS) บนทุก tenant-scoped table
- Soft delete ผ่าน `archived_at`
- Tenant isolation ผ่าน `current_tenant_body_id()`
- No DELETE policy — ใช้ archive แทน

## 📄 License

Private — สำหรับคริสตจักรชีวิตสุขสันต์กาฬสินธุ์

---

Built with ❤️ for Team G Kalasin
