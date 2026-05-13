export type AdminTab = 'dashboard' | 'users' | 'events' | 'support' | 'growth' | 'moderation';

export type LegacyAdminPage = 'overview' | 'events' | 'users' | 'participants' | 'support';

export type AdminSupportStatus = 'new' | 'in_progress' | 'resolved';
export type AdminSupportStatusFilter = 'all' | AdminSupportStatus;

export type AdminStats = {
  totalUsers: number | null;
  totalEvents: number | null;
  upcomingEvents: number | null;
  supportRequests: number | null;
  bannedUsers: number | null;
  proUsers: number | null;
  pendingReports: number | null;
  reviewingReports: number | null;
};

export type AdminUserRole = 'user' | 'admin' | string;
export type AdminUserPlan = 'free' | 'pro' | string;

export type AdminAttentionTarget =
  | 'support-new'
  | 'events-without-participants'
  | 'events-without-city'
  | 'events-without-location'
  | 'users-without-name'
  | 'banned-users'
  | 'pending-join-requests'
  | 'pending-reports';

export type AdminAttentionItem = {
  id: AdminAttentionTarget;
  label: string;
  description: string;
  count: number | null;
  targetTab: AdminTab;
};

export type AdminUserFilters = {
  search: string;
  role: 'all' | 'admin' | 'user';
  status: 'all' | 'active' | 'banned';
  plan: 'all' | 'free' | 'pro' | 'unlimited';
  sort: 'created_desc' | 'created_asc';
};

export type AdminEventFilters = {
  search: string;
  time: 'all' | 'upcoming' | 'past';
  visibility: 'all' | 'public' | 'private';
  joinMode: 'all' | 'open' | 'request';
  city: string;
  activityType: string;
  sort: 'date_asc' | 'date_desc' | 'created_desc' | 'created_asc';
};

export type AdminSupportFilters = {
  search: string;
  status: AdminSupportStatusFilter;
  sort: 'newest' | 'oldest';
};

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: AdminUserRole | null;
  plan: AdminUserPlan | null;
  has_unlimited_access: boolean | null;
  is_banned: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  accepted_legal_version: string | null;
  accepted_terms_at: string | null;
  accepted_privacy_at: string | null;
};

export type AdminUserDetails = AdminUserRow;

export type AdminEventRow = {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  date_time: string | null;
  created_at: string | null;
  creator_id: string | null;
  activity_type: string | null;
  join_mode: 'open' | 'request' | string | null;
  visibility: 'public' | 'private' | string | null;
  status: string | null;
  participants_count: number | null;
};

export type AdminEventParticipantRow = {
  id: string;
  user_id: string | null;
  name: string | null;
  status: string | null;
  joined_at: string | null;
};

export type AdminEventDetails = AdminEventRow & {
  participants?: AdminEventParticipantRow[];
};

export type AdminSupportRequestRow = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  subject: string | null;
  message: string | null;
  status: AdminSupportStatus;
  admin_note: string | null;
  can_edit_admin_note: boolean;
  created_at: string | null;
};

export type AdminGrowthMetrics = {
  eventsByCity: Array<{ key: string; count: number }>;
  eventsByActivityType: Array<{ key: string; count: number }>;
  eventsByJoinMode: Array<{ key: string; count: number }>;
  usersByPlan: Array<{ key: string; count: number }>;
  usersByRole: Array<{ key: string; count: number }>;
  usersByBannedStatus: Array<{ key: string; count: number }>;
  eventsWithoutParticipants: AdminEventRow[];
  latestUsers: AdminUserRow[];
  latestEvents: AdminEventRow[];
  warnings: string[];
};

export type AdminGrowthSnapshot = AdminGrowthMetrics;

export type AdminReportStatus = 'pending' | 'reviewing' | 'resolved' | 'rejected';
export type AdminReportStatusFilter = 'all' | AdminReportStatus;
export type AdminReportTargetType = 'user' | 'event';
export type AdminReportTargetTypeFilter = 'all' | AdminReportTargetType;

export type AdminReportRow = {
  id: string;
  reporter_id: string;
  target_type: AdminReportTargetType;
  target_id: string;
  reason: string;
  details: string | null;
  status: AdminReportStatus;
  admin_note: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string | null;
};

export type AdminReportFilters = {
  status: AdminReportStatusFilter;
  targetType: AdminReportTargetTypeFilter;
  search: string;
};

export type AdminAuditTargetType = 'user' | 'event' | 'support_request' | 'report' | 'system';

export type AdminAuditAction =
  | 'user.ban'
  | 'user.unban'
  | 'user.plan_update'
  | 'user.unlimited_update'
  | 'event.visibility_update'
  | 'event.delete'
  | 'support.status_update'
  | 'support.note_update'
  | 'report.status_update'
  | 'report.note_update'
  | string;

export type AdminAuditLogRow = {
  id: string;
  admin_id: string;
  action: AdminAuditAction;
  target_type: AdminAuditTargetType;
  target_id: string | null;
  old_value: unknown | null;
  new_value: unknown | null;
  created_at: string | null;
};

export type AdminAuditFilters = {
  action: string;
  targetType: 'all' | AdminAuditTargetType;
  adminId: string;
};
