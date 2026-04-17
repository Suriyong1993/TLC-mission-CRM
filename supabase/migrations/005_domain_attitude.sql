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
