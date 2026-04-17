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
