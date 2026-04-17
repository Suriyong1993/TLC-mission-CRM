-- Migration: 011_rls_policies.sql
-- Row Level Security policies for all tenant-scoped tables

-- Enable RLS on all tenant-scoped tables
ALTER TABLE care_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attitude_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_makj_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners too
ALTER TABLE care_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE members FORCE ROW LEVEL SECURITY;
ALTER TABLE meetings FORCE ROW LEVEL SECURITY;
ALTER TABLE attendance_records FORCE ROW LEVEL SECURITY;
ALTER TABLE attitude_assessments FORCE ROW LEVEL SECURITY;
ALTER TABLE visit_records FORCE ROW LEVEL SECURITY;
ALTER TABLE pillar_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE group_makj_snapshots FORCE ROW LEVEL SECURITY;
ALTER TABLE meeting_reports FORCE ROW LEVEL SECURITY;
ALTER TABLE leaders FORCE ROW LEVEL SECURITY;

-- Helper function to apply tenant policies
CREATE OR REPLACE FUNCTION apply_tenant_policies(table_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- SELECT policy
  EXECUTE format('CREATE POLICY IF NOT EXISTS tenant_isolation_select ON %I
    FOR SELECT USING (body_id = current_tenant_body_id() OR is_admin())', table_name);
  
  -- INSERT policy
  EXECUTE format('CREATE POLICY IF NOT EXISTS tenant_isolation_insert ON %I
    FOR INSERT WITH CHECK (body_id = current_tenant_body_id() OR is_admin())', table_name);
  
  -- UPDATE policy
  EXECUTE format('CREATE POLICY IF NOT EXISTS tenant_isolation_update ON %I
    FOR UPDATE USING (body_id = current_tenant_body_id() OR is_admin())
    WITH CHECK (body_id = current_tenant_body_id() OR is_admin())', table_name);
END;
$$;

-- Apply policies to all tables
SELECT apply_tenant_policies('care_groups');
SELECT apply_tenant_policies('members');
SELECT apply_tenant_policies('meetings');
SELECT apply_tenant_policies('attendance_records');
SELECT apply_tenant_policies('attitude_assessments');
SELECT apply_tenant_policies('visit_records');
SELECT apply_tenant_policies('pillar_snapshots');
SELECT apply_tenant_policies('group_makj_snapshots');
SELECT apply_tenant_policies('meeting_reports');
SELECT apply_tenant_policies('leaders');

-- Revoke DELETE on all tables (soft delete via archived_at only)
REVOKE DELETE ON care_groups FROM authenticated;
REVOKE DELETE ON members FROM authenticated;
REVOKE DELETE ON meetings FROM authenticated;
REVOKE DELETE ON attendance_records FROM authenticated;
REVOKE DELETE ON attitude_assessments FROM authenticated;
REVOKE DELETE ON visit_records FROM authenticated;
REVOKE DELETE ON pillar_snapshots FROM authenticated;
REVOKE DELETE ON group_makj_snapshots FROM authenticated;
REVOKE DELETE ON meeting_reports FROM authenticated;
REVOKE DELETE ON leaders FROM authenticated;

-- Allow authenticated to see bodies (for reference)
CREATE POLICY IF NOT EXISTS bodies_select_all ON bodies
  FOR SELECT TO authenticated USING (true);
