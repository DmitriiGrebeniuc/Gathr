alter table public.reports
  add column if not exists reviewed_at timestamptz null,
  add column if not exists reviewed_by uuid null references auth.users(id),
  add column if not exists resolution text null,
  add column if not exists duplicate_of uuid null references public.reports(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reports_resolution_check'
  ) then
    alter table public.reports
      add constraint reports_resolution_check
      check (
        resolution is null or
        resolution in ('action_taken', 'no_violation', 'duplicate', 'insufficient_info')
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reports_resolved_status_has_resolved_at'
  ) then
    alter table public.reports
      add constraint reports_resolved_status_has_resolved_at
      check (status not in ('resolved', 'rejected') or resolved_at is not null)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'reports_reviewing_status_has_reviewed_at'
  ) then
    alter table public.reports
      add constraint reports_reviewing_status_has_reviewed_at
      check (status <> 'reviewing' or reviewed_at is not null)
      not valid;
  end if;
end $$;

create index if not exists reports_status_target_created_at_idx
  on public.reports (status, target_type, created_at desc);

alter table public.events
  add column if not exists moderation_status text not null default 'active',
  add column if not exists moderation_reason text null,
  add column if not exists moderated_at timestamptz null,
  add column if not exists moderated_by uuid null references auth.users(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_moderation_status_check'
  ) then
    alter table public.events
      add constraint events_moderation_status_check
      check (moderation_status in ('active', 'hidden', 'removed'))
      not valid;
  end if;
end $$;

alter table public.profiles
  add column if not exists ban_reason text null,
  add column if not exists banned_at timestamptz null,
  add column if not exists banned_by uuid null references auth.users(id);

drop policy if exists "Users can create own reports" on public.reports;
revoke insert on public.reports from authenticated;

grant select on public.reports to authenticated;
grant update (
  status,
  admin_note,
  resolved_at,
  resolved_by,
  reviewed_at,
  reviewed_by,
  resolution,
  duplicate_of
) on public.reports to authenticated;

create or replace function public.create_report(
  p_target_type text,
  p_target_id uuid,
  p_reason text,
  p_details text default null
)
returns public.reports
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_reason text := btrim(coalesce(p_reason, ''));
  v_details text := nullif(left(btrim(coalesce(p_details, '')), 1000), '');
  v_report public.reports;
begin
  if v_user_id is null then
    raise exception 'Authentication is required to create a report';
  end if;

  if p_target_type not in ('user', 'event') then
    raise exception 'Invalid report target type';
  end if;

  if p_target_id is null then
    raise exception 'Report target is required';
  end if;

  if v_reason = '' then
    raise exception 'Report reason is required';
  end if;

  if p_target_type = 'user' and p_target_id = v_user_id then
    raise exception 'You cannot report yourself';
  end if;

  if exists (
    select 1
    from public.reports
    where reporter_id = v_user_id
      and target_type = p_target_type
      and target_id = p_target_id
      and created_at >= now() - interval '24 hours'
  ) then
    raise exception 'You already submitted a report recently';
  end if;

  if (
    select count(*)
    from public.reports
    where reporter_id = v_user_id
      and created_at >= now() - interval '24 hours'
  ) >= 10 then
    raise exception 'Report limit reached';
  end if;

  insert into public.reports (
    reporter_id,
    target_type,
    target_id,
    reason,
    details
  )
  values (
    v_user_id,
    p_target_type,
    p_target_id,
    v_reason,
    v_details
  )
  returning * into v_report;

  return v_report;
end;
$$;

revoke all on function public.create_report(text, uuid, text, text) from public;
grant execute on function public.create_report(text, uuid, text, text) to authenticated;
