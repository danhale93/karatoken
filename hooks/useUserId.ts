import { supabase } from '../lib/supabase';

export function getCurrentUserId() {
  const { data: { user } } = supabase.auth.getUser();
  return user?.id || null;
}

export async function getCurrentUserIdAsync() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}