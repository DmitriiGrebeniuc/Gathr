import { supabase } from '../../lib/supabase';

export type CreateEventWithCreatorInput = {
  title: string;
  description: string | null;
  dateTime: string;
  location: string | null;
  locationPlaceId: string | null;
  locationLat: number | null;
  locationLng: number | null;
  city: string | null;
  cityNormalized: string | null;
  activityType: string;
  visibility?: 'public' | 'private';
  joinMode?: 'open' | 'request';
};

export type UpdateEventWithCreatorInput = CreateEventWithCreatorInput & {
  eventId: string;
};

export type EventPrivateDetails = {
  event_id: string;
  date_time: string | null;
  location: string | null;
  location_place_id: string | null;
  location_lat: number | null;
  location_lng: number | null;
};

export type EventJoinRequestStatus = 'pending' | 'approved' | 'rejected';

export type EventJoinRequest = {
  id: string;
  event_id: string;
  requester_id: string;
  message: string | null;
  status: EventJoinRequestStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type CreatorEventJoinRequest = EventJoinRequest & {
  requester_name: string | null;
};

export async function fetchEventFeedSortRanks(
  eventIds: Array<string | null | undefined>
): Promise<Record<string, number>> {
  const uniqueEventIds = Array.from(
    new Set(
      eventIds.filter(
        (eventId): eventId is string =>
          typeof eventId === 'string' && eventId.trim().length > 0
      )
    )
  );

  if (uniqueEventIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase.rpc('get_event_feed_sort_ranks', {
    target_event_ids: uniqueEventIds,
  });

  if (error) {
    console.error('Failed to load event feed sort ranks:', error);
    return {};
  }

  return (
    (data as Array<{ event_id: string | null; sort_rank: number | string | null }> | null) || []
  ).reduce<Record<string, number>>((acc, row) => {
    if (!row?.event_id) {
      return acc;
    }

    const parsedRank =
      typeof row.sort_rank === 'number'
        ? row.sort_rank
        : Number.parseInt(String(row.sort_rank ?? ''), 10);

    if (!Number.isNaN(parsedRank)) {
      acc[row.event_id] = parsedRank;
    }

    return acc;
  }, {});
}

export async function fetchPublicProfileNameMap(
  ids: Array<string | null | undefined>
): Promise<Record<string, string>> {
  const uniqueIds = Array.from(
    new Set(ids.filter((id): id is string => typeof id === 'string' && id.trim().length > 0))
  );

  if (uniqueIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, name')
    .in('id', uniqueIds);

  if (error) {
    console.error('Failed to load public profile names:', error);
    return {};
  }

  return ((data as Array<{ id: string; name: string | null }> | null) || []).reduce<
    Record<string, string>
  >((acc, profile) => {
    if (profile?.id) {
      acc[profile.id] = profile.name || '';
    }

    return acc;
  }, {});
}

// Counts are intentionally loaded through RPC so public/anonymous views do not
// need direct access to participant identities.
export async function fetchParticipantCounts(
  eventIds: Array<string | null | undefined>
): Promise<Record<string, number>> {
  const uniqueEventIds = Array.from(
    new Set(
      eventIds.filter((eventId): eventId is string => typeof eventId === 'string' && eventId.trim().length > 0)
    )
  );

  if (uniqueEventIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase.rpc('get_visible_event_participant_counts', {
    target_event_ids: uniqueEventIds,
  });

  if (error) {
    console.error('Failed to load participant counts via RPC:', error);
    return Object.fromEntries(uniqueEventIds.map((eventId) => [eventId, 0]));
  }

  const rows =
    (data as Array<{ event_id: string | null; participant_count: number | string | null }> | null) ||
    [];

  const countsMap = Object.fromEntries(uniqueEventIds.map((eventId) => [eventId, 0]));

  rows.forEach((row) => {
    if (!row?.event_id) {
      return;
    }

    const parsedCount =
      typeof row.participant_count === 'number'
        ? row.participant_count
        : Number.parseInt(String(row.participant_count ?? 0), 10);

    countsMap[row.event_id] = Number.isNaN(parsedCount) ? 0 : parsedCount;
  });

  return countsMap;
}

export async function fetchJoinedEventIdsForUser(userId: string | null): Promise<string[]> {
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('participants')
    .select('event_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to load joined event ids:', error);
    return [];
  }

  return (((data as Array<{ event_id: string | null }> | null) || [])
    .map((row) => row.event_id)
    .filter((eventId): eventId is string => typeof eventId === 'string' && eventId.trim().length > 0));
}

// Caller must only use this when the current user is allowed to see identities:
// event creator, event participant, or admin. RLS is still the final guard.
export async function fetchParticipantIdentityRows(
  eventId: string
): Promise<Array<{ event_id: string; user_id: string }>> {
  const { data, error } = await supabase
    .from('participants')
    .select('event_id, user_id')
    .eq('event_id', eventId);

  if (error) {
    console.error(`Failed to load participant identities for event ${eventId}:`, error);
    return [];
  }

  return (((data as Array<{ event_id: string | null; user_id: string | null }> | null) || [])
    .filter(
      (row): row is { event_id: string; user_id: string } =>
        typeof row?.event_id === 'string' &&
        row.event_id.trim().length > 0 &&
        typeof row?.user_id === 'string' &&
        row.user_id.trim().length > 0
    ));
}

export async function fetchMyProfileAccessSummary(): Promise<{
  id: string;
  name: string | null;
  role: string | null;
  plan: string | null;
  has_unlimited_access: boolean | null;
} | null> {
  const { data, error } = await supabase.rpc('get_my_profile_access');

  if (error) {
    console.error('Failed to load current profile access summary:', error);
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row || typeof row !== 'object') {
    return null;
  }

  return {
    id: typeof row.id === 'string' ? row.id : '',
    name: typeof row.name === 'string' ? row.name : null,
    role: typeof row.role === 'string' ? row.role : null,
    plan: typeof row.plan === 'string' ? row.plan : null,
    has_unlimited_access:
      typeof row.has_unlimited_access === 'boolean' ? row.has_unlimited_access : null,
  };
}

export async function updateMyProfileName(newName: string): Promise<{
  data: { id: string; name: string | null } | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .rpc('update_my_profile_name', {
      new_name: newName,
    })
    .maybeSingle();

  return {
    data: (data as { id: string; name: string | null } | null) || null,
    error,
  };
}

export async function createEventWithCreator(input: CreateEventWithCreatorInput): Promise<{
  data: Record<string, any> | null;
  error: unknown;
}> {
  const { data, error } = await supabase.rpc('create_event_with_creator', {
    new_title: input.title,
    new_description: input.description,
    new_date_time: input.dateTime,
    new_location: input.location,
    new_location_place_id: input.locationPlaceId,
    new_location_lat: input.locationLat,
    new_location_lng: input.locationLng,
    new_city: input.city,
    new_city_normalized: input.cityNormalized,
    new_activity_type: input.activityType,
    new_visibility: input.visibility ?? 'public',
    new_join_mode: input.joinMode ?? 'open',
  });

  return {
    data: (data as Record<string, any> | null) || null,
    error,
  };
}

export async function updateEventWithCreator(input: UpdateEventWithCreatorInput): Promise<{
  data: Record<string, any> | null;
  error: unknown;
}> {
  const { data, error } = await supabase.rpc('update_event_with_creator', {
    target_event_id: input.eventId,
    new_title: input.title,
    new_description: input.description,
    new_date_time: input.dateTime,
    new_location: input.location,
    new_location_place_id: input.locationPlaceId,
    new_location_lat: input.locationLat,
    new_location_lng: input.locationLng,
    new_city: input.city,
    new_city_normalized: input.cityNormalized,
    new_activity_type: input.activityType,
    new_visibility: input.visibility ?? 'public',
    new_join_mode: input.joinMode ?? 'open',
  });

  return {
    data: (data as Record<string, any> | null) || null,
    error,
  };
}

export async function fetchEventPrivateDetails(
  eventId: string | null | undefined
): Promise<EventPrivateDetails | null> {
  if (!eventId) {
    return null;
  }

  const { data, error } = await supabase
    .rpc('get_event_private_details', {
      target_event_id: eventId,
    })
    .maybeSingle();

  if (error) {
    console.error(`Failed to load private details for event ${eventId}:`, error);
    return null;
  }

  return (data as EventPrivateDetails | null) ?? null;
}

export async function fetchAccessibleEventPrivateDetailsMap(
  eventIds: Array<string | null | undefined>
): Promise<Record<string, EventPrivateDetails>> {
  const uniqueEventIds = Array.from(
    new Set(
      eventIds.filter(
        (eventId): eventId is string =>
          typeof eventId === 'string' && eventId.trim().length > 0
      )
    )
  );

  if (uniqueEventIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('event_private_details')
    .select(
      'event_id, date_time, location, location_place_id, location_lat, location_lng'
    )
    .in('event_id', uniqueEventIds);

  if (error) {
    console.error('Failed to load accessible event private details:', error);
    return {};
  }

  return (
    (data as EventPrivateDetails[] | null) || []
  ).reduce<Record<string, EventPrivateDetails>>((acc, row) => {
    if (row?.event_id) {
      acc[row.event_id] = row;
    }

    return acc;
  }, {});
}

export async function fetchMyEventJoinRequest(
  eventId: string | null | undefined
): Promise<EventJoinRequest | null> {
  if (!eventId) {
    return null;
  }

  const { data, error } = await supabase
    .rpc('get_my_event_join_request', {
      target_event_id: eventId,
    })
    .maybeSingle();

  if (error) {
    console.error(`Failed to load my join request for event ${eventId}:`, error);
    return null;
  }

  return (data as EventJoinRequest | null) ?? null;
}

export async function createEventJoinRequest(
  eventId: string,
  message: string | null
): Promise<{
  data: EventJoinRequest | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .rpc('create_event_join_request', {
      target_event_id: eventId,
      request_message: message,
    })
    .maybeSingle();

  return {
    data: (data as EventJoinRequest | null) ?? null,
    error,
  };
}

export async function fetchCreatorEventJoinRequests(
  eventId: string | null | undefined
): Promise<CreatorEventJoinRequest[]> {
  if (!eventId) {
    return [];
  }

  const { data, error } = await supabase.rpc('creator_list_event_join_requests', {
    target_event_id: eventId,
  });

  if (error) {
    console.error(`Failed to load creator join requests for event ${eventId}:`, error);
    return [];
  }

  return ((data as CreatorEventJoinRequest[] | null) || []);
}

export async function reviewEventJoinRequest(
  requestId: string,
  nextStatus: Extract<EventJoinRequestStatus, 'approved' | 'rejected'>
): Promise<{
  data: EventJoinRequest | null;
  error: unknown;
}> {
  const { data, error } = await supabase
    .rpc('review_event_join_request', {
      target_request_id: requestId,
      next_status: nextStatus,
    })
    .maybeSingle();

  return {
    data: (data as EventJoinRequest | null) ?? null,
    error,
  };
}
