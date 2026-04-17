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
