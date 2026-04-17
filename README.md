# TLC-mission CRM - Quick Start

ระบบติดตามพันธกิจคริสตจักรแบบครบวงจร สำหรับทีมพันธกิจกาฬสินธุ์

## ⚡ เริ่มต้นใช้งานใน 10 นาที

### 1️⃣ Deploy (3 นาที)
- ไปที่ https://vercel.com/new
- Import: `Suriyong1993/TLC-mission-CRM`
- **Root Directory**: `oikos-mission` ⚠️ สำคัญมาก!
- Environment Variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://jhibxvtialvltlsljdrq.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_iqHPcL5S5EYGr-yJll9dqQ_qO84jd94
  ```
- กด Deploy

### 2️⃣ Database (5 นาที)
- ไปที่ https://supabase.com/dashboard/project/jhibxvtialvltlsljdrq
- เปิด **SQL Editor**
- รันไฟล์: https://raw.githubusercontent.com/Suriyong1993/TLC-mission-CRM/master/supabase/migrations/999_combined_all.sql

### 3️⃣ Users (2 นาที)
- ไปที่ **Authentication > Users**
- สร้าง 6 users:

| Email | Body |
|-------|------|
| `body_1@mission.local` | เมือง 1 |
| `body_2@mission.local` | เมือง 2 |
| `body_3@mission.local` | สมเด็จ |
| `body_4@mission.local` | ท่าคันโท |
| `body_5@mission.local` | กุฉินารายณ์ |
| `body_6@mission.local` | คำใหญ่ |

✅ **เสร็จแล้ว!** ทดสอบ Login ได้เลย

---

## 🏗️ สถาปัตยกรรมระบบ

### 3 Domains (แยกข้อมูลชัดเจน)
1. **Attendance** - การเข้าร่วม (มาตรงเวลา, มาสาย, ขาด, ยังไม่ได้สร้างผู้นำ)
2. **Attitude** - ทัศนคติ (พร้อม, ยังไม่พร้อม, ยังไม่ได้สร้างผู้นำ)
3. **Visits** - การเยี่ยม (ญาติมิตร, สมาชิก, บอร์ดสร้างผู้นำ)

### 8 Pillars (MAK)
สถิติรายสัปดาห์:
1. การประกาศ
2. การติดตามผล
3. การอภิบาล
4. สร้างผู้นำ
5. อธิษฐานพุธ
6. พพช.
7. มาคจ.
8. มาแคร์

---

## 📚 เอกสารเพิ่มเติม
- **คู่มือ Deploy ฉบับเต็ม**: [DEPLOY.md](./DEPLOY.md)
- **คู่มือตั้งค่า Supabase**: [SETUP.md](./SETUP.md)
- **เอกสารออกแบบระบบ**: [CLAUDE.md](./CLAUDE.md)

## 🔗 Links สำคัญ
- GitHub: https://github.com/Suriyong1993/TLC-mission-CRM
- SQL รวม (รันไฟล์เดียว): https://raw.githubusercontent.com/Suriyong1993/TLC-mission-CRM/master/supabase/migrations/999_combined_all.sql
- Supabase Project: https://supabase.com/dashboard/project/jhibxvtialvltlsljdrq

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

**สร้างโดย**: TLC-mission Team  
**เวอร์ชั่น**: 1.0.0  
**อัพเดท**: April 2025
