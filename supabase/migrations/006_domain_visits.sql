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
