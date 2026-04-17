// TLC-mission CRM — Domain types
// These types mirror the Supabase schema but are app-specific

export interface Body {
  id: string;
  name: string;
  code: string;
  color_hex: string;
  sort_order: number;
  organization_id: string | null;
}

export interface CareGroup {
  id: string;
  body_id: string;
  organization_id: string | null;
  code: string;
  leader_name: string;
  coordinator_name: string | null;
  coordinator_phone: string | null;
  meeting_day: string | null;
  meeting_time: string | null;
  village: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string;
  lat: number | null;
  lng: number | null;
  sort_order: number;
  archived_at: string | null;
}

export interface Member {
  id: string;
  body_id: string;
  organization_id: string | null;
  care_group_id: string | null;
  full_name: string;
  nickname: string | null;
  age: number | null;
  occupation: string | null;
  workplace: string | null;
  family_status: string | null;
  believed_at: string | null;
  responsible_person: string | null;
  goal_text: string | null;
  goal_quarter: string | null;
  phone: string | null;
  line_id: string | null;
  avatar_url: string | null;
  is_guest: boolean;
  is_active: boolean;
  archived_at: string | null;
}

export interface Leader {
  id: string;
  body_id: string;
  organization_id: string | null;
  member_id: string | null;
  full_name: string;
  role: "หนบ." | "หนค." | "พล.1" | "พล.2";
  pipeline_stage: string | null;
  target_role: string | null;
  appointed_at: string | null;
  mentor_id: string | null;
  archived_at: string | null;
}

export interface Meeting {
  id: string;
  body_id: string;
  care_group_id: string;
  meeting_date: string;
  week_number: number;
  iso_year: number;
  topic: string | null;
  bible_reference: string | null;
  location: string | null;
  reporter_name: string | null;
  present_count: number;
  leave_count: number;
  absent_count: number;
  guest_count: number;
}

export interface AttendanceRecord {
  id: string;
  body_id: string;
  meeting_id: string;
  member_id: string;
  status: "present" | "leave" | "absent";
  note: string | null;
}

export interface AttitudeAssessment {
  id: string;
  body_id: string;
  member_id: string;
  level: "ดี" | "ปานกลาง" | "น้อย";
  effective_date: string;
  assessed_by_name: string;
  assessment_period: string | null;
  notes: string | null;
}

export interface VisitRecord {
  id: string;
  body_id: string;
  member_id: string;
  visit_date: string;
  visited_by_name: string;
  result: "พบตัว" | "ไม่อยู่" | "นัดใหม่" | "ทางโทรศัพท์" | "ทาง LINE";
  topic: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  prayer_generated_by_ai: string | null;
}

export interface PillarSnapshot {
  id: string;
  body_id: string;
  week_number: number;
  iso_year: number;
  pillar_1: number;
  pillar_2: number;
  pillar_3: number;
  pillar_4: number;
  pillar_5: number;
  pillar_6: number;
  pillar_7: number;
  pillar_8: number;
  goal_1: number | null;
  goal_2: number | null;
  goal_3: number | null;
  goal_4: number | null;
  goal_5: number | null;
  goal_6: number | null;
  goal_7: number | null;
  goal_8: number | null;
  recorded_by_name: string | null;
  snapshot_at: string;
  superseded_by: string | null;
}

export interface GroupMakjSnapshot {
  id: string;
  body_id: string;
  care_group_id: string;
  week_number: number;
  iso_year: number;
  makj_count: number;
  size_classification: "BIG" | "STD" | "MINI" | "EMPTY";
  recorded_by_name: string | null;
  snapshot_at: string;
  superseded_by: string | null;
}

export interface MeetingReport {
  id: string;
  body_id: string;
  meeting_id: string | null;
  care_group_id: string;
  week_number: number;
  iso_year: number;
  report_date: string;
  bible_reference: string | null;
  bible_verse_text: string | null;
  key_points: string[] | null;
  activities: string[] | null;
  takeaways: string[] | null;
  special_notes: string | null;
  photos: { url: string; caption: string; category: string }[] | null;
  ai_summary: string | null;
  ai_summary_used: boolean;
  created_by_name: string | null;
}

export interface TenantContext {
  userId: string;
  userEmail: string;
  bodyId: string;
  bodyName: string;
  bodyCode: string;
  bodyColor: string;
  organizationId: string | null;
}

export type AlertSeverity = "critical" | "warning" | "missing_data" | "ok";

export interface MemberAlert {
  memberId: string;
  fullName: string;
  groupId: string | null;
  groupCode: string | null;
  currentAttitude: "ดี" | "ปานกลาง" | "น้อย" | null;
  lastVisitDate: string | null;
  daysSinceVisit: number | null;
  attendanceRate: number | null;
  severity: AlertSeverity;
}
