-- TLC-mission CRM — Master Schema
-- "ซับซ้อนข้างใน เรียบง่ายข้างนอก"

-- ── 1. TENANT MANAGEMENT (BODIES) ──
CREATE TABLE bodies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  color_hex text DEFAULT '#3b82f6',
  sort_order integer DEFAULT 0,
  organization_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ── 2. CORE DOMAINS ──

-- CARE GROUPS (Dynamic CRUD)
CREATE TABLE care_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  organization_id uuid,
  code text NOT NULL,
  leader_name text NOT NULL,
  coordinator_name text,
  coordinator_phone text,
  meeting_day text,
  meeting_time text,
  village text,
  subdistrict text,
  district text,
  province text DEFAULT 'กาฬสินธุ์',
  lat double precision,
  lng double precision,
  sort_order integer DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MEMBERS
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  organization_id uuid,
  care_group_id uuid REFERENCES care_groups(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  nickname text,
  age integer,
  occupation text,
  workplace text,
  family_status text,
  believed_at date,
  responsible_person text,
  goal_text text,
  goal_quarter text,
  phone text,
  line_id text,
  avatar_url text,
  is_guest boolean DEFAULT false,
  is_active boolean DEFAULT true,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- LEADERS (Pipeline)
CREATE TABLE leaders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  organization_id uuid,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  role text CHECK (role IN ('หนบ.', 'หนค.', 'พล.1', 'พล.2')),
  pipeline_stage text,
  target_role text,
  appointed_at date,
  mentor_id uuid REFERENCES leaders(id) ON DELETE SET NULL,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MEETINGS (for Attendance)
CREATE TABLE meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  care_group_id uuid NOT NULL REFERENCES care_groups(id) ON DELETE CASCADE,
  meeting_date date NOT NULL,
  week_number integer NOT NULL,
  iso_year integer NOT NULL,
  topic text,
  bible_reference text,
  location text,
  reporter_name text,
  present_count integer DEFAULT 0,
  leave_count integer DEFAULT 0,
  absent_count integer DEFAULT 0,
  guest_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ATTENDANCE RECORDS
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status text CHECK (status IN ('present', 'leave', 'absent')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- ATTITUDE ASSESSMENTS (Separated Domain)
CREATE TABLE attitude_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  level text CHECK (level IN ('ดี', 'ปานกลาง', 'น้อย')),
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz DEFAULT now()
);

-- VISIT RECORDS (Pastoral Domain)
CREATE TABLE visit_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  visitor_name text NOT NULL,
  topic text,
  action_plan text,
  prayer_requests text,
  created_at timestamptz DEFAULT now()
);

-- ── 3. WEEKLY SNAPSHOTS (IMMUTABLE) ──

-- 8-PILLAR SNAPSHOTS
CREATE TABLE pillar_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  iso_year integer NOT NULL,
  pillar_1 integer DEFAULT 0,
  pillar_2 integer DEFAULT 0,
  pillar_3 integer DEFAULT 0,
  pillar_4 integer DEFAULT 0,
  pillar_5 integer DEFAULT 0,
  pillar_6 integer DEFAULT 0,
  pillar_7 integer DEFAULT 0,
  pillar_8 integer DEFAULT 0,
  recorded_by uuid, -- user_id from auth.users
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  superseded_by uuid REFERENCES pillar_snapshots(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- GROUP MAKJ SNAPSHOTS (Quick Entry)
CREATE TABLE group_makj_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_id uuid NOT NULL REFERENCES bodies(id) ON DELETE CASCADE,
  care_group_id uuid NOT NULL REFERENCES care_groups(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  iso_year integer NOT NULL,
  attendance_count integer DEFAULT 0,
  recorded_by uuid, -- user_id from auth.users
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  superseded_by uuid REFERENCES group_makj_snapshots(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ── 4. ROW LEVEL SECURITY (RLS) ──

-- Function to get current body_id from auth context
-- Usage: email = {body_id}@mission.local
CREATE OR REPLACE FUNCTION current_tenant()
RETURNS uuid AS $$
  SELECT (auth.jwt() ->> 'email')::text::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Enable RLS on all tables
ALTER TABLE bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attitude_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_makj_snapshots ENABLE ROW LEVEL SECURITY;

-- Default Policy: Body-level isolation
-- Note: Simplified for current scope (email-based tenant detection)
-- In a real setup, we'd use a user_bodies junction or app_metadata.

CREATE POLICY body_isolation_bodies ON bodies
  FOR ALL USING (id = current_tenant());

CREATE POLICY body_isolation_care_groups ON care_groups
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_members ON members
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_leaders ON leaders
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_meetings ON meetings
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_attendance_records ON attendance_records
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_attitude_assessments ON attitude_assessments
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_visit_records ON visit_records
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_pillar_snapshots ON pillar_snapshots
  FOR ALL USING (body_id = current_tenant());

CREATE POLICY body_isolation_group_makj_snapshots ON group_makj_snapshots
  FOR ALL USING (body_id = current_tenant());
