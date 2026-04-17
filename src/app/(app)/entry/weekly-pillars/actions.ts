'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function saveWeeklyPillars(formData: FormData) {
  const supabase = await createClient();

  // Get current user/tenant info
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const bodyId = user.email?.split('@')[0];
  if (!bodyId) return { error: 'Invalid user session' };

  // Get body UUID from its code
  const { data: body } = await supabase
    .from('bodies')
    .select('id')
    .eq('code', bodyId)
    .single();

  if (!body) return { error: 'Body not found' };

  const weekNumber = parseInt(formData.get('week_number') as string);
  const isoYear = parseInt(formData.get('iso_year') as string);

  const pillars = {
    pillar_1: parseInt(formData.get('pillar_1') as string || '0'),
    pillar_2: parseInt(formData.get('pillar_2') as string || '0'),
    pillar_3: parseInt(formData.get('pillar_3') as string || '0'),
    pillar_4: parseInt(formData.get('pillar_4') as string || '0'),
    pillar_5: parseInt(formData.get('pillar_5') as string || '0'),
    pillar_6: parseInt(formData.get('pillar_6') as string || '0'),
    pillar_7: parseInt(formData.get('pillar_7') as string || '0'),
    pillar_8: parseInt(formData.get('pillar_8') as string || '0'),
  };

  // 1. Mark existing record for this week as superseded
  const { data: existing } = await supabase
    .from('pillar_snapshots')
    .select('id')
    .eq('body_id', body.id)
    .eq('week_number', weekNumber)
    .eq('iso_year', isoYear)
    .is('superseded_by', null)
    .single();

  // 2. Insert new snapshot
  const { data: newSnapshot, error: insertError } = await supabase
    .from('pillar_snapshots')
    .insert({
      body_id: body.id,
      week_number: weekNumber,
      iso_year: isoYear,
      ...pillars,
      recorded_by: user.id,
      snapshot_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) return { error: insertError.message };

  // 3. Update old record's superseded_by
  if (existing) {
    await supabase
      .from('pillar_snapshots')
      .update({ superseded_by: newSnapshot.id })
      .eq('id', existing.id);
  }

  revalidatePath('/');
  revalidatePath('/entry/weekly-pillars');
  return { success: true };
}
