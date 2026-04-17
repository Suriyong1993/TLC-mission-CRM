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
