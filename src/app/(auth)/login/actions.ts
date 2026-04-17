'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const tab = formData.get('tab') as string;
  const selectedBody = formData.get('selectedBody') as string;
  const password = formData.get('password') as string;

  const email = tab === 'body' ? `${selectedBody}@mission.local` : 'admin@mission.local';

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/');
}
