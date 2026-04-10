import { supabase } from '../../lib/supabase';

export async function loadSharedEventById(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .maybeSingle();

  if (error) {
    console.error('Ошибка загрузки shared event:', error);
    return null;
  }

  return data || null;
}
