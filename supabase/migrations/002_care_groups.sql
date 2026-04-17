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
