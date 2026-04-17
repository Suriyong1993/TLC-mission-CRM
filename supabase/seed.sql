-- Seed data for development/testing
-- Run after schema is created

-- Sample members
DO $$
DECLARE
  g01_id UUID;
  g02_id UUID;
  body1_id UUID;
BEGIN
  SELECT id INTO body1_id FROM bodies WHERE code = 'body_1';
  SELECT id INTO g01_id FROM care_groups WHERE code = 'G01' AND body_id = body1_id;
  SELECT id INTO g02_id FROM care_groups WHERE code = 'G02' AND body_id = body1_id;

  -- Insert sample members if not exists
  INSERT INTO members (body_id, care_group_id, full_name, nickname, age, phone, is_active) VALUES
    (body1_id, g01_id, 'สมชาย ใจดี', 'ชาย', 35, '0812345678', true),
    (body1_id, g01_id, 'สมหญิง รักษ์ดี', 'หญิง', 32, '0823456789', true),
    (body1_id, g01_id, 'ประเสริฐ วงศ์ใหญ่', 'เสริฐ', 45, '0834567890', true),
    (body1_id, g02_id, 'มานี รักดี', 'มานี', 28, '0845678901', true),
    (body1_id, g02_id, 'สมศรี มีสุข', 'ศรี', 52, '0856789012', true)
  ON CONFLICT DO NOTHING;
END $$;

-- Sample attitude assessments
DO $$
DECLARE
  member1_id UUID;
  member2_id UUID;
BEGIN
  SELECT id INTO member1_id FROM members WHERE full_name = 'สมชาย ใจดี' LIMIT 1;
  SELECT id INTO member2_id FROM members WHERE full_name = 'สมหญิง รักษ์ดี' LIMIT 1;

  INSERT INTO attitude_assessments (body_id, member_id, level, effective_date, assessed_by_name, assessment_period) VALUES
    ((SELECT body_id FROM members WHERE id = member1_id), member1_id, 'ดี', CURRENT_DATE - 7, 'ผู้นำทดสอบ', 'Q1 2026'),
    ((SELECT body_id FROM members WHERE id = member2_id), member2_id, 'ปานกลาง', CURRENT_DATE - 14, 'ผู้นำทดสอบ', 'Q1 2026')
  ON CONFLICT DO NOTHING;
END $$;

-- Sample leaders
DO $$
DECLARE
  body1_id UUID;
  body2_id UUID;
  body3_id UUID;
BEGIN
  SELECT id INTO body1_id FROM bodies WHERE code = 'body_1';
  SELECT id INTO body2_id FROM bodies WHERE code = 'body_2';
  SELECT id INTO body3_id FROM bodies WHERE code = 'body_3';

  INSERT INTO leaders (body_id, full_name, role, pipeline_stage, appointed_at) VALUES
    (body1_id, 'สมชาย ผู้นำ', 'หนบ.', null, CURRENT_DATE - 365),
    (body1_id, 'สมหญิง รอง', 'หนค.', null, CURRENT_DATE - 180),
    (body2_id, 'ประเสริฐ ผู้นำ', 'หนบ.', null, CURRENT_DATE - 200),
    (body3_id, 'มานี คนเก่ง', 'พล.1', 'กำลังพัฒนา', null),
    (body3_id, 'สมศรี นักสร้าง', null, 'ใกล้พร้อม', null)
  ON CONFLICT DO NOTHING;
END $$;

-- Sample pillar snapshot for current week
DO $$
DECLARE
  body1_id UUID;
  current_week INT;
  current_year INT;
BEGIN
  SELECT id INTO body1_id FROM bodies WHERE code = 'body_1';
  SELECT EXTRACT(WEEK FROM CURRENT_DATE)::INT INTO current_week;
  SELECT EXTRACT(ISOYEAR FROM CURRENT_DATE)::INT INTO current_year;

  INSERT INTO pillar_snapshots 
    (body_id, week_number, iso_year, pillar_1, pillar_2, pillar_3, pillar_4, pillar_5, pillar_6, pillar_7, pillar_8,
     goal_1, goal_2, goal_3, goal_4, goal_5, goal_6, goal_7, goal_8, recorded_by_name)
  VALUES
    (body1_id, current_week, current_year, 60, 800, 82, 94, 25, 60, 200, 200,
     60, 800, 82, 94, 25, 60, 200, 200, 'ระบบทดสอบ')
  ON CONFLICT DO NOTHING;
END $$;
