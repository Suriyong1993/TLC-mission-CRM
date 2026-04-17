'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveWeeklyMakj(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const bodyId = user.email?.split('@')[0];
  if (!bodyId) return { error: 'Invalid user session' };

  const { data: body } = await supabase
    .from('bodies')
    .select('id')
    .eq('code', bodyId)
    .single();

  if (!body) return { error: 'Body not found' };

  const weekNumber = parseInt(formData.get('week_number') as string);
  const isoYear = parseInt(formData.get('iso_year') as string);

  // Extract group counts from formData
  const groupCounts: { care_group_id: string; attendance_count: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('group_')) {
      const careGroupId = key.replace('group_', '');
      const attendanceCount = parseInt(value as string);
      if (!isNaN(attendanceCount)) {
        groupCounts.push({ care_group_id: careGroupId, attendance_count: attendanceCount });
      }
    }
  }

  if (groupCounts.length === 0) return { error: 'No data to save' };

  // For each group, follow the immutable snapshot pattern
  for (const item of groupCounts) {
    // 1. Mark existing as superseded
    const { data: existing } = await supabase
      .from('group_makj_snapshots')
      .select('id')
      .eq('care_group_id', item.care_group_id)
      .eq('week_number', weekNumber)
      .eq('iso_year', isoYear)
      .is('superseded_by', null)
      .single();

    // 2. Insert new
    const { data: newSnapshot, error: insertError } = await supabase
      .from('group_makj_snapshots')
      .insert({
        body_id: body.id,
        care_group_id: item.care_group_id,
        week_number: weekNumber,
        iso_year: isoYear,
        attendance_count: item.attendance_count,
        recorded_by: user.id,
        snapshot_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) continue; // Or handle error

    // 3. Update old
    if (existing) {
      await supabase
        .from('group_makj_snapshots')
        .update({ superseded_by: newSnapshot.id })
        .eq('id', existing.id);
    }
  }

  revalidatePath('/');
  revalidatePath('/entry/weekly-makj');
  return { success: true };
}
