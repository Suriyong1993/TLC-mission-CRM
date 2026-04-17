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
