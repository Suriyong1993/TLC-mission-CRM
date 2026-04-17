-- Combined Schema: Run all migrations in order
-- This file combines all migrations for easy deployment

\echo 'Starting TLC-mission CRM Schema Migration...'

-- 001: Organizations and Bodies
\i 001_organizations_bodies.sql

-- 002: Care Groups
\i 002_care_groups.sql

-- 003: Members and Leaders
\i 003_members_leaders.sql

-- 004: Domain 1 - Attendance
\i 004_domain_attendance.sql

-- 005: Domain 2 - Attitude
\i 005_domain_attitude.sql

-- 006: Domain 3 - Visits
\i 006_domain_visits.sql

-- 007: Weekly Snapshots
\i 007_weekly_snapshots.sql

-- 008: Meeting Reports
\i 008_meeting_reports.sql

-- 009: Alerts View
\i 009_alerts_view.sql

-- 010: RLS Tenant Function
\i 010_rls_tenant_function.sql

-- 011: RLS Policies
\i 011_rls_policies.sql

\echo 'Schema migration complete!'
\echo 'Next steps:'
\echo '1. Set up Supabase Storage buckets: avatars, groups, reports'
\echo '2. Configure auth.users with email pattern body_X@mission.local'
\echo '3. Generate types: supabase gen types typescript --linked > src/types/database.types.ts'
