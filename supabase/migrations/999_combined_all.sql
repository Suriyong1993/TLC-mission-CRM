-- Migration: 001_organizations_bodies.sql
-- Organizations and Bodies tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations table (future-ready, nullable)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- 2. Bodies table (6 bodies)
CREATE TABLE IF NOT EXISTS bodies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  color_hex TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Seed data: Organization
INSERT INTO organizations (name, code)
VALUES ('คริสตจักรชีวิตสุขสันต์กาฬสินธุ์', 'SUKHSAN')
ON CONFLICT (code) DO NOTHING;

-- Seed data: 6 Bodies
INSERT INTO bodies (name, code, color_hex, sort_order, organization_id)
VALUES
  ('เมือง 1', 'body_1', '#3b82f6', 1, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('เมือง 2', 'body_2', '#06b6d4', 2, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('สมเด็จ', 'body_3', '#8b5cf6', 3, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('ท่าคันโท', 'body_4', '#10b981', 4, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('กุฉินารายณ์', 'body_5', '#f59e0b', 5, (SELECT id FROM organizations WHERE code='SUKHSAN')),
  ('คำใหญ่', 'body_6', '#ec4899', 6, (SELECT id FROM organizations WHERE code='SUKHSAN'))
ON CONFLICT (code) DO NOTHING;
-- Migration: 002_care_groups.sql
-- Care groups table - fully dynamic (Decision 1)

CREATE TABLE IF NOT EXISTS care_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  code TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  coordinator_name TEXT,
  coordinator_phone TEXT,
  
  meeting_day TEXT,
  meeting_time TIME,
  village TEXT,
  subdistrict TEXT,
  district TEXT,
  province TEXT DEFAULT 'กาฬสินธุ์',
  lat NUMERIC(10, 6),
  lng NUMERIC(10, 6),
  
  coordinator_photo_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ,
  
  UNIQUE(body_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_care_groups_body ON care_groups(body_id) WHERE archived_at IS NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_care_groups_updated_at ON care_groups;
CREATE TRIGGER update_care_groups_updated_at
    BEFORE UPDATE ON care_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed data: TLC-mission groups G01-G20
DO $$
DECLARE
  body1_id UUID;
  body2_id UUID;
  body3_id UUID;
  body4_id UUID;
  body5_id UUID;
  body6_id UUID;
BEGIN
  SELECT id INTO body1_id FROM bodies WHERE code = 'body_1';
  SELECT id INTO body2_id FROM bodies WHERE code = 'body_2';
  SELECT id INTO body3_id FROM bodies WHERE code = 'body_3';
  SELECT id INTO body4_id FROM bodies WHERE code = 'body_4';
  SELECT id INTO body5_id FROM bodies WHERE code = 'body_5';
  SELECT id INTO body6_id FROM bodies WHERE code = 'body_6';

  INSERT INTO care_groups (body_id, code, leader_name, sort_order) VALUES
    (body1_id, 'G01', 'ผุสดี', 1),
    (body1_id, 'G02', 'เบญ', 2),
    (body1_id, 'G03', 'ปุนนาภา', 3),
    (body2_id, 'G04', 'ทัศนา', 4),
    (body2_id, 'G05', 'ดาวใจ', 5),
    (body2_id, 'G06', 'กิตติพงษ์', 6),
    (body3_id, 'G07', 'สมชาย', 7),
    (body3_id, 'G08', 'วรรณา', 8),
    (body3_id, 'G09', 'ประเสริฐ', 9),
    (body4_id, 'G10', 'สุดา', 10),
    (body4_id, 'G11', 'มานะ', 11),
    (body4_id, 'G12', 'พรทิพย์', 12),
    (body5_id, 'G13', 'สมศรี', 13),
    (body5_id, 'G14', 'ประทีป', 14),
    (body5_id, 'G15', 'รัตนา', 15),
    (body6_id, 'G16', 'ชัยวัฒน์', 16),
    (body6_id, 'G17', 'นิตยา', 17),
    (body6_id, 'G18', 'สมพงษ์', 18),
    (body6_id, 'G19', 'วิไล', 19),
    (body6_id, 'G20', 'บุญมี', 20)
  ON CONFLICT (body_id, code) DO UPDATE SET 
    leader_name = EXCLUDED.leader_name,
    sort_order = EXCLUDED.sort_order;
END $$;
-- Migration: 003_members_leaders.sql
-- Members and Leaders tables

-- 1. Members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  care_group_id UUID REFERENCES care_groups(id),
  
  -- Identity
  full_name TEXT NOT NULL,
  nickname TEXT,
  age INT,
  occupation TEXT,
  workplace TEXT,
  family_status TEXT,
  
  -- Faith journey
  believed_at DATE,
  responsible_person TEXT,
  
  -- Goals
  goal_text TEXT,
  goal_quarter TEXT CHECK (goal_quarter IN ('Q1','Q2','Q3','Q4') OR goal_quarter IS NULL),
  
  -- Contact
  phone TEXT,
  line_id TEXT,
  avatar_url TEXT,
  
  -- Flags
  is_guest BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

-- Indexes for members
CREATE INDEX IF NOT EXISTS idx_members_body ON members(body_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_members_group ON members(care_group_id) WHERE archived_at IS NULL;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Leaders table (Leadership pipeline)
CREATE TABLE IF NOT EXISTS leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  member_id UUID REFERENCES members(id),
  
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('หนบ.', 'หนค.', 'พล.1', 'พล.2')),
  
  -- For pipeline
  pipeline_stage TEXT CHECK (pipeline_stage IN ('เริ่มสร้าง', 'กำลังพัฒนา', 'ใกล้พร้อม', 'พร้อมแต่งตั้ง')),
  target_role TEXT CHECK (target_role IN ('หนบ.', 'หนค.', 'พล.1', 'พล.2')),
  
  appointed_at DATE,
  mentor_id UUID REFERENCES leaders(id),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_leaders_body_role ON leaders(body_id, role) WHERE archived_at IS NULL;
-- Migration: 004_domain_attendance.sql
-- Attendance domain - Domain 1 of 3 (Decision 4)

-- 1. Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  care_group_id UUID NOT NULL REFERENCES care_groups(id),
  
  meeting_date DATE NOT NULL,
  week_number INT NOT NULL,
  iso_year INT NOT NULL,
  
  topic TEXT,
  bible_reference TEXT,
  location TEXT,
  reporter_name TEXT,
  
  -- Aggregates (denormalized for speed)
  present_count INT DEFAULT 0,
  leave_count INT DEFAULT 0,
  absent_count INT DEFAULT 0,
  guest_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meetings_group_week ON meetings(care_group_id, week_number, iso_year);

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. Attendance status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('present', 'leave', 'absent');
  END IF;
END $$;

-- 3. Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id),
  
  status attendance_status NOT NULL,
  note TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(meeting_id, member_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance_records(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance_records(meeting_id);
-- Migration: 005_domain_attitude.sql
-- Attitude domain - Domain 2 of 3 (Decision 4)

-- Attitude level enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attitude_level') THEN
    CREATE TYPE attitude_level AS ENUM ('ดี', 'ปานกลาง', 'น้อย');
  END IF;
END $$;

-- Attitude assessments table
CREATE TABLE IF NOT EXISTS attitude_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  member_id UUID NOT NULL REFERENCES members(id),
  
  level attitude_level NOT NULL,
  effective_date DATE NOT NULL,
  assessed_by_name TEXT NOT NULL,
  assessment_period TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attitude_member_date ON attitude_assessments(member_id, effective_date DESC);
-- Migration: 006_domain_visits.sql
-- Visits domain - Domain 3 of 3 (Decision 4)

-- Visit result enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'visit_result') THEN
    CREATE TYPE visit_result AS ENUM ('พบตัว', 'ไม่อยู่', 'นัดใหม่', 'ทางโทรศัพท์', 'ทาง LINE');
  END IF;
END $$;

-- Visit records table
CREATE TABLE IF NOT EXISTS visit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  member_id UUID NOT NULL REFERENCES members(id),
  
  visit_date DATE NOT NULL,
  visited_by_name TEXT NOT NULL,
  result visit_result NOT NULL,
  
  topic TEXT,
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  
  prayer_generated_by_ai TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visits_member_date ON visit_records(member_id, visit_date DESC);
-- Migration: 007_weekly_snapshots.sql
-- Weekly Snapshots - Immutable pattern (Decision 3)

-- 1. Pillar snapshots (8 pillars, weekly, body-level)
CREATE TABLE IF NOT EXISTS pillar_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  
  week_number INT NOT NULL,
  iso_year INT NOT NULL,
  
  pillar_1 INT NOT NULL DEFAULT 0,
  pillar_2 INT NOT NULL DEFAULT 0,
  pillar_3 INT NOT NULL DEFAULT 0,
  pillar_4 INT NOT NULL DEFAULT 0,
  pillar_5 INT NOT NULL DEFAULT 0,
  pillar_6 INT NOT NULL DEFAULT 0,
  pillar_7 INT NOT NULL DEFAULT 0,
  pillar_8 INT NOT NULL DEFAULT 0,
  
  goal_1 INT, goal_2 INT, goal_3 INT, goal_4 INT,
  goal_5 INT, goal_6 INT, goal_7 INT, goal_8 INT,
  
  recorded_by_user_id UUID,
  recorded_by_name TEXT,
  
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_by UUID REFERENCES pillar_snapshots(id),
  
  CONSTRAINT valid_week CHECK (week_number BETWEEN 1 AND 53)
);

CREATE INDEX IF NOT EXISTS idx_pillar_body_week ON pillar_snapshots(body_id, iso_year, week_number)
  WHERE superseded_by IS NULL;

-- 2. Group MAKJ snapshots (per-group มาคจ., weekly)
CREATE TABLE IF NOT EXISTS group_makj_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  care_group_id UUID NOT NULL REFERENCES care_groups(id),
  
  week_number INT NOT NULL,
  iso_year INT NOT NULL,
  
  makj_count INT NOT NULL,
  size_classification TEXT GENERATED ALWAYS AS (
    CASE
      WHEN makj_count >= 12 THEN 'BIG'
      WHEN makj_count >= 7  THEN 'STD'
      WHEN makj_count >= 1  THEN 'MINI'
      ELSE 'EMPTY'
    END
  ) STORED,
  
  recorded_by_name TEXT,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  superseded_by UUID REFERENCES group_makj_snapshots(id),
  
  CONSTRAINT valid_week CHECK (week_number BETWEEN 1 AND 53),
  CONSTRAINT non_negative CHECK (makj_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_makj_group_week ON group_makj_snapshots(care_group_id, iso_year, week_number)
  WHERE superseded_by IS NULL;
CREATE INDEX IF NOT EXISTS idx_makj_body_week ON group_makj_snapshots(body_id, iso_year, week_number)
  WHERE superseded_by IS NULL;
-- Migration: 008_meeting_reports.sql
-- Meeting reports for LINE sharing

CREATE TABLE IF NOT EXISTS meeting_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id UUID NOT NULL REFERENCES bodies(id),
  organization_id UUID REFERENCES organizations(id),
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  care_group_id UUID NOT NULL REFERENCES care_groups(id),
  
  week_number INT NOT NULL,
  iso_year INT NOT NULL,
  report_date DATE NOT NULL,
  
  bible_reference TEXT,
  bible_verse_text TEXT,
  key_points JSONB DEFAULT '[]',
  activities JSONB DEFAULT '[]',
  takeaways JSONB DEFAULT '[]',
  special_notes TEXT,
  
  photos JSONB DEFAULT '[]',
  
  ai_summary TEXT,
  ai_summary_used BOOLEAN DEFAULT false,
  
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_group_week ON meeting_reports(care_group_id, iso_year, week_number);

DROP TRIGGER IF EXISTS update_meeting_reports_updated_at ON meeting_reports;
CREATE TRIGGER update_meeting_reports_updated_at
    BEFORE UPDATE ON meeting_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
-- Migration: 009_alerts_view.sql
-- Alerts computed view (Cross-domain alerts from Decision 4)

CREATE OR REPLACE VIEW current_alerts AS
SELECT
  m.id as member_id,
  m.body_id,
  m.full_name,
  m.care_group_id,
  cg.code as group_code,
  
  -- Attitude (from attitude_assessments)
  latest_attitude.level as current_attitude,
  latest_attitude.effective_date as attitude_date,
  
  -- Visit (from visit_records)
  latest_visit.visit_date as last_visit_date,
  (CURRENT_DATE - latest_visit.visit_date) as days_since_visit,
  
  -- Attendance (from attendance_records)
  recent_attendance.attendance_rate,
  
  -- Severity classification
  CASE
    WHEN latest_attitude.level = 'น้อย'
         AND (CURRENT_DATE - COALESCE(latest_visit.visit_date, '1900-01-01'::date)) > 30
      THEN 'critical'
    WHEN recent_attendance.attendance_rate < 0.5
         OR (CURRENT_DATE - COALESCE(latest_visit.visit_date, '1900-01-01'::date)) > 45
      THEN 'warning'
    WHEN latest_attitude.level IS NULL
         OR m.age IS NULL
      THEN 'missing_data'
    ELSE 'ok'
  END as severity

FROM members m
LEFT JOIN care_groups cg ON cg.id = m.care_group_id
LEFT JOIN LATERAL (
  SELECT level, effective_date
  FROM attitude_assessments
  WHERE member_id = m.id
  ORDER BY effective_date DESC LIMIT 1
) latest_attitude ON true
LEFT JOIN LATERAL (
  SELECT visit_date
  FROM visit_records
  WHERE member_id = m.id
  ORDER BY visit_date DESC LIMIT 1
) latest_visit ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE status = 'present')::NUMERIC /
    NULLIF(COUNT(*), 0) as attendance_rate
  FROM attendance_records ar
  JOIN meetings mt ON mt.id = ar.meeting_id
  WHERE ar.member_id = m.id
    AND mt.meeting_date > CURRENT_DATE - INTERVAL '3 months'
) recent_attendance ON true

WHERE m.archived_at IS NULL;

-- Add comments
COMMENT ON VIEW current_alerts IS 'Cross-domain alert view combining attitude, visits, and attendance (Decision 4)';
-- Migration: 010_rls_tenant_function.sql
-- Helper function for tenant isolation (Decision 2)

-- This function is the ONLY place where tenant resolution happens
CREATE OR REPLACE FUNCTION current_tenant_body_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  body_code TEXT;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Pattern: body_1@mission.local → body_1
  body_code := split_part(user_email, '@', 1);
  
  -- Return matching body id
  RETURN (SELECT id FROM bodies WHERE code = body_code LIMIT 1);
END;
$$;

-- Alternative function for admin users (can see all bodies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  RETURN user_email LIKE '%@admin%' OR user_email LIKE '%admin@%';
END;
$$;

-- Current user body info view
CREATE OR REPLACE VIEW current_user_body AS
SELECT 
  b.id as body_id,
  b.name as body_name,
  b.code as body_code,
  b.color_hex as body_color
FROM bodies b
WHERE b.id = current_tenant_body_id();
-- Migration: 011_rls_policies.sql
-- Row Level Security policies for all tenant-scoped tables

-- Enable RLS on all tenant-scoped tables
ALTER TABLE care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attitude_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_makj_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too
ALTER TABLE care_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE members FORCE ROW LEVEL SECURITY;
ALTER TABLE meetings FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance_records FORCE ROW LEVEL SECURITY;
ALTER TABLE attitude_assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE visit_records FORCE ROW LEVEL SECURITY;
ALTER TABLE pillar_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE group_makj_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE meeting_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE leaders FORCE ROW LEVEL SECURITY;

-- Helper function to apply tenant policies
CREATE OR REPLACE FUNCTION apply_tenant_policies(table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- SELECT policy
  EXECUTE format('CREATE POLICY IF NOT EXISTS tenant_isolation_select ON %I
    FOR SELECT USING (body_id = current_tenant_body_id() OR is_admin())', table_name);
  
  -- INSERT policy
  EXECUTE format('CREATE POLICY IF NOT EXISTS tenant_isolation_insert ON %I
    FOR INSERT WITH CHECK (body_id = current_tenant_body_id() OR is_admin())', table_name);
  
  -- UPDATE policy
  EXECUTE format('CREATE POLICY IF NOT EXISTS tenant_isolation_update ON %I
    FOR UPDATE USING (body_id = current_tenant_body_id() OR is_admin())
    WITH CHECK (body_id = current_tenant_body_id() OR is_admin())', table_name);
END;
$$;

-- Apply policies to all tables
SELECT apply_tenant_policies('care_groups');
SELECT apply_tenant_policies('members');
SELECT apply_tenant_policies('meetings');
SELECT apply_tenant_policies('attendance_records');
SELECT apply_tenant_policies('attitude_assessments');
SELECT apply_tenant_policies('visit_records');
SELECT apply_tenant_policies('pillar_snapshots');
SELECT apply_tenant_policies('group_makj_snapshots');
SELECT apply_tenant_policies('meeting_reports');
SELECT apply_tenant_policies('leaders');

-- Revoke DELETE on all tables (soft delete via archived_at only)
REVOKE DELETE ON care_groups FROM authenticated;
REVOKE DELETE ON members FROM authenticated;
REVOKE DELETE ON meetings FROM authenticated;
REVOKE DELETE ON attendance_records FROM authenticated;
REVOKE DELETE ON attitude_assessments FROM authenticated;
REVOKE DELETE ON visit_records FROM authenticated;
REVOKE DELETE ON pillar_snapshots FROM authenticated;
REVOKE DELETE ON group_makj_snapshots FROM authenticated;
REVOKE DELETE ON meeting_reports FROM authenticated;
REVOKE DELETE ON leaders FROM authenticated;

-- Allow authenticated to see bodies (for reference)
CREATE POLICY IF NOT EXISTS bodies_select_all ON bodies
  FOR SELECT TO authenticated USING (true);
