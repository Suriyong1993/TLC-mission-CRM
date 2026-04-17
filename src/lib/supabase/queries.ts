import { SupabaseClient } from '@supabase/supabase-js';

export async function fetchDashboardStats(supabase: SupabaseClient, bodyId: string) {
  // Parallel fetch for hero stats
  const [
    { count: groupCount },
    { count: memberCount },
    { count: attitudeLowCount }
  ] = await Promise.all([
    supabase.from('care_groups').select('*', { count: 'exact', head: true }).eq('body_id', bodyId).is('archived_at', null),
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('body_id', bodyId).is('archived_at', null),
    supabase.from('attitude_assessments').select('*', { count: 'exact', head: true }).eq('body_id', bodyId).eq('level', 'น้อย')
  ]);

  return {
    groupCount: groupCount || 0,
    memberCount: memberCount || 0,
    meetingCount: 0, // Placeholder
    attitudeLowCount: attitudeLowCount || 0
  };
}

export async function fetchLatestPillars(supabase: SupabaseClient, bodyId: string) {
  const { data } = await supabase
    .from('pillar_snapshots')
    .select('*')
    .eq('body_id', bodyId)
    .is('superseded_by', null)
    .order('snapshot_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function fetchCareGroups(supabase: SupabaseClient, bodyId: string) {
  const { data } = await supabase
    .from('care_groups')
    .select('*')
    .eq('body_id', bodyId)
    .is('archived_at', null)
    .order('sort_order', { ascending: true });

  return data || [];
}
