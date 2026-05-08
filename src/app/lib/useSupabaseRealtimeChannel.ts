import { useEffect, type DependencyList } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

export function useSupabaseRealtimeChannel(
  createChannel: () => RealtimeChannel | null | undefined,
  dependencies: DependencyList
) {
  useEffect(() => {
    const channel = createChannel();

    if (!channel) {
      return undefined;
    }

    return () => {
      void supabase.removeChannel(channel);
    };
  }, dependencies);
}
