create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id),
  action text not null,
  target_type text not null,
  target_id uuid null,
  old_value jsonb null,
  new_value jsonb null,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_action_not_empty check (btrim(action) <> ''),
  constraint admin_audit_log_target_type_check check (
    target_type in ('user', 'event', 'support_request', 'report', 'system')
  )
);

create index if not exists admin_audit_log_created_at_idx
  on public.admin_audit_log (created_at desc);

create index if not exists admin_audit_log_admin_id_idx
  on public.admin_audit_log (admin_id);

create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id),
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  details text null,
  status text not null default 'pending',
  admin_note text null,
  resolved_at timestamptz null,
  resolved_by uuid null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint reports_reason_not_empty check (btrim(reason) <> ''),
  constraint reports_status_check check (status in ('pending', 'reviewing', 'resolved', 'rejected')),
  constraint reports_target_type_check check (target_type in ('user', 'event'))
);

create index if not exists reports_status_created_at_idx
  on public.reports (status, created_at desc);

create index if not exists reports_reporter_id_idx
  on public.reports (reporter_id);

create index if not exists reports_target_idx
  on public.reports (target_type, target_id);

alter table public.admin_audit_log enable row level security;
alter table public.reports enable row level security;

revoke all on public.admin_audit_log from anon, authenticated;
revoke all on public.reports from anon, authenticated;
grant select, insert on public.admin_audit_log to authenticated;
grant select, insert on public.reports to authenticated;
grant update (status, admin_note, resolved_at, resolved_by) on public.reports to authenticated;

drop policy if exists "Admins can read audit log" on public.admin_audit_log;
create policy "Admins can read audit log"
  on public.admin_audit_log
  for select
  to authenticated
  using (app_private.is_admin());

drop policy if exists "Admins can insert audit log" on public.admin_audit_log;
create policy "Admins can insert audit log"
  on public.admin_audit_log
  for insert
  to authenticated
  with check (app_private.is_admin() and admin_id = auth.uid());

drop policy if exists "Users can create own reports" on public.reports;
create policy "Users can create own reports"
  on public.reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "Users can read own reports" on public.reports;
create policy "Users can read own reports"
  on public.reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

drop policy if exists "Admins can read all reports" on public.reports;
create policy "Admins can read all reports"
  on public.reports
  for select
  to authenticated
  using (app_private.is_admin());

drop policy if exists "Admins can update reports" on public.reports;
create policy "Admins can update reports"
  on public.reports
  for update
  to authenticated
  using (app_private.is_admin())
  with check (app_private.is_admin());

create or replace function public.log_admin_action(
  p_action text,
  p_target_type text,
  p_target_id uuid,
  p_old_value jsonb default null,
  p_new_value jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public, app_private
as $$
declare
  v_log_id uuid;
begin
  if auth.uid() is null or not app_private.is_admin() then
    raise exception 'Only admins can write audit log';
  end if;

  if p_action is null or btrim(p_action) = '' then
    raise exception 'Audit action cannot be empty';
  end if;

  insert into public.admin_audit_log (
    admin_id,
    action,
    target_type,
    target_id,
    old_value,
    new_value
  )
  values (
    auth.uid(),
    p_action,
    p_target_type,
    p_target_id,
    p_old_value,
    p_new_value
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

revoke all on function public.log_admin_action(text, text, uuid, jsonb, jsonb) from public;
grant execute on function public.log_admin_action(text, text, uuid, jsonb, jsonb) to authenticated;
