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
