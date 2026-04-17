-- Migration: 010_rls_tenant_function.sql
-- Helper function for tenant isolation (Decision 2)

-- This function is the ONLY place where tenant resolution happens
CREATE OR REPLACE FUNCTION current_tenant_body_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
  body_code TEXT;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Pattern: body_1@mission.local → body_1
  body_code := split_part(user_email, '@', 1);
  
  -- Return matching body id
  RETURN (SELECT id FROM bodies WHERE code = body_code LIMIT 1);
END;
$$;

-- Alternative function for admin users (can see all bodies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  RETURN user_email LIKE '%@admin%' OR user_email LIKE '%admin@%';
END;
$$;

-- Current user body info view
CREATE OR REPLACE VIEW current_user_body AS
SELECT 
  b.id as body_id,
  b.name as body_name,
  b.code as body_code,
  b.color_hex as body_color
FROM bodies b
WHERE b.id = current_tenant_body_id();
