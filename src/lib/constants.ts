// TLC-mission CRM Constants
// Groups are DYNAMIC (Decision 1) — these are display labels only, never used as enum

export const PILLAR_NAMES = [
  "การประกาศ",
  "การติดตามผล",
  "การอภิบาล",
  "สร้างผู้นำ",
  "อธิษฐานเช้าพุธ",
  "การเข้า พพช.",
  "การมาคริสตจักร",
  "การมาแคร์กรุ๊ป",
] as const;

export const PILLAR_EMOJIS = ["📢", "🔍", "🤗", "⭐", "🙏", "📖", "⛪", "🏠"] as const;

export const ATTITUDE_LEVELS = ["ดี", "ปานกลาง", "น้อย"] as const;
export type AttitudeLevel = (typeof ATTITUDE_LEVELS)[number];

export const LEADERSHIP_ROLES = ["หนบ.", "หนค.", "พล.1", "พล.2"] as const;
export type LeadershipRole = (typeof LEADERSHIP_ROLES)[number];

export const PIPELINE_STAGES = [
  "เริ่มสร้าง",
  "กำลังพัฒนา",
  "ใกล้พร้อม",
  "พร้อมแต่งตั้ง",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const ATTENDANCE_STATUSES = ["present", "leave", "absent"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const VISIT_RESULTS = [
  "พบตัว",
  "ไม่อยู่",
  "นัดใหม่",
  "ทางโทรศัพท์",
  "ทาง LINE",
] as const;
export type VisitResult = (typeof VISIT_RESULTS)[number];

export const SIZE_THRESHOLDS = { BIG: 12, STD: 7, MINI: 1 } as const;

export const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
] as const;

export const THAI_MONTHS_FULL = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
] as const;

export const THAI_DAYS_SHORT = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."] as const;

export const BUDDHIST_ERA_OFFSET = 543;
