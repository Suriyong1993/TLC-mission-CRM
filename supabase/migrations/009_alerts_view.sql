-- Migration: 009_alerts_view.sql
-- Alerts computed view (Cross-domain alerts from Decision 4)

CREATE OR REPLACE VIEW current_alerts AS
SELECT
  m.id as member_id,
  m.body_id,
  m.full_name,
  m.care_group_id,
  cg.code as group_code,
  
  -- Attitude (from attitude_assessments)
  latest_attitude.level as current_attitude,
  latest_attitude.effective_date as attitude_date,
  
  -- Visit (from visit_records)
  latest_visit.visit_date as last_visit_date,
  (CURRENT_DATE - latest_visit.visit_date) as days_since_visit,
  
  -- Attendance (from attendance_records)
  recent_attendance.attendance_rate,
  
  -- Severity classification
  CASE
    WHEN latest_attitude.level = 'น้อย'
         AND (CURRENT_DATE - COALESCE(latest_visit.visit_date, '1900-01-01'::date)) > 30
      THEN 'critical'
    WHEN recent_attendance.attendance_rate < 0.5
         OR (CURRENT_DATE - COALESCE(latest_visit.visit_date, '1900-01-01'::date)) > 45
      THEN 'warning'
    WHEN latest_attitude.level IS NULL
         OR m.age IS NULL
      THEN 'missing_data'
    ELSE 'ok'
  END as severity

FROM members m
LEFT JOIN care_groups cg ON cg.id = m.care_group_id
LEFT JOIN LATERAL (
  SELECT level, effective_date
  FROM attitude_assessments
  WHERE member_id = m.id
  ORDER BY effective_date DESC LIMIT 1
) latest_attitude ON true
LEFT JOIN LATERAL (
  SELECT visit_date
  FROM visit_records
  WHERE member_id = m.id
  ORDER BY visit_date DESC LIMIT 1
) latest_visit ON true
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) FILTER (WHERE status = 'present')::NUMERIC /
    NULLIF(COUNT(*), 0) as attendance_rate
  FROM attendance_records ar
  JOIN meetings mt ON mt.id = ar.meeting_id
  WHERE ar.member_id = m.id
    AND mt.meeting_date > CURRENT_DATE - INTERVAL '3 months'
) recent_attendance ON true

WHERE m.archived_at IS NULL;

-- Add comments
COMMENT ON VIEW current_alerts IS 'Cross-domain alert view combining attitude, visits, and attendance (Decision 4)';
