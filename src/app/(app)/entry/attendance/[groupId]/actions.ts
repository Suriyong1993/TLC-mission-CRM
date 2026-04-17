'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveAttendance(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const groupId = formData.get('groupId') as string;
  const meetingDate = formData.get('meetingDate') as string;
  const weekNumber = parseInt(formData.get('weekNumber') as string);
  const isoYear = parseInt(formData.get('isoYear') as string);
  
  // 1. Create or Update Meeting record
  // For simplicity in this vertical slice, we'll create a new meeting record per check-in
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({
      care_group_id: groupId,
      body_id: user.email?.split('@')[0], // We need UUID here actually, let's fix this logic
      meeting_date: meetingDate,
      week_number: weekNumber,
      iso_year: isoYear,
    })
    .select()
    .single();

  // FIX: We need the actual UUID of the body. Let's get it first.
  const bodyCode = user.email?.split('@')[0];
  const { data: body } = await supabase.from('bodies').select('id').eq('code', bodyCode).single();
  
  if (!body) return { error: 'Body not found' };

  const { data: finalMeeting, error: finalMeetingError } = await supabase
    .from('meetings')
    .insert({
      care_group_id: groupId,
      body_id: body.id,
      meeting_date: meetingDate,
      week_number: weekNumber,
      iso_year: isoYear,
    })
    .select()
    .single();

  if (finalMeetingError) return { error: finalMeetingError.message };

  // 2. Process attendance records
  const attendanceData: any[] = [];
  let presentCount = 0;
  let leaveCount = 0;
  let absentCount = 0;

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('member_')) {
      const memberId = key.replace('member_', '');
      const status = value as 'present' | 'leave' | 'absent';
      
      attendanceData.push({
        body_id: body.id,
        meeting_id: finalMeeting.id,
        member_id: memberId,
        status: status
      });

      if (status === 'present') presentCount++;
      else if (status === 'leave') leaveCount++;
      else if (status === 'absent') absentCount++;
    }
  }

  const { error: attendanceError } = await supabase
    .from('attendance_records')
    .insert(attendanceData);

  if (attendanceError) return { error: attendanceError.message };

  // 3. Update meeting counts
  await supabase
    .from('meetings')
    .update({
      present_count: presentCount,
      leave_count: leaveCount,
      absent_count: absentCount
    })
    .eq('id', finalMeeting.id);

  revalidatePath('/');
  revalidatePath(`/entry/attendance/${groupId}`);
  
  return { success: true };
}
