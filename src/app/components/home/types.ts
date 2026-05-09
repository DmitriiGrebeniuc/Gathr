import type { ActivityType } from '../../constants/activityTypes';

export type HomeTab = 'discover' | 'joined' | 'my' | 'visited' | 'overview';

export type HomeEventItem = {
  id: string;
  title: string;
  description?: string | null;
  created_at?: string | null;
  sort_rank?: number | null;
  is_past?: boolean | null;
  date_time?: string | null;
  location?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  city?: string | null;
  city_normalized?: string | null;
  creator_id?: string | null;
  creatorName?: string | null;
  activity_type?: ActivityType | null;
  join_mode?: 'open' | 'request' | null;
  participantCount: number;
};

export type CityFilterOption = {
  city: string;
  cityNormalized: string;
};
