create table if not exists public.app_diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id),
  level text not null default 'info',
  source text not null,
  event_name text not null,
  message text null,
  metadata jsonb null,
  url text null,
  user_agent text null,
  app_version text null,
  created_at timestamptz not null default now(),
  constraint app_diagnostics_level_check check (level in ('debug', 'info', 'warning', 'error')),
  constraint app_diagnostics_source_not_empty check (btrim(source) <> ''),
  constraint app_diagnostics_event_name_not_empty check (btrim(event_name) <> '')
);

create index if not exists app_diagnostics_created_at_idx
  on public.app_diagnostics (created_at desc);

create index if not exists app_diagnostics_level_created_at_idx
  on public.app_diagnostics (level, created_at desc);

create index if not exists app_diagnostics_source_created_at_idx
  on public.app_diagnostics (source, created_at desc);

create index if not exists app_diagnostics_user_created_at_idx
  on public.app_diagnostics (user_id, created_at desc);

alter table public.app_diagnostics enable row level security;

revoke all on public.app_diagnostics from anon, authenticated;
grant insert on public.app_diagnostics to authenticated;
grant select on public.app_diagnostics to authenticated;

drop policy if exists "Users can insert own diagnostics" on public.app_diagnostics;
create policy "Users can insert own diagnostics"
  on public.app_diagnostics
  for insert
  to authenticated
  with check (user_id = auth.uid() or user_id is null);

drop policy if exists "Admins can read diagnostics" on public.app_diagnostics;
create policy "Admins can read diagnostics"
  on public.app_diagnostics
  for select
  to authenticated
  using (app_private.is_admin());

create or replace function public.log_app_diagnostic(
  p_level text,
  p_source text,
  p_event_name text,
  p_message text default null,
  p_metadata jsonb default null,
  p_url text default null,
  p_user_agent text default null,
  p_app_version text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_level text := coalesce(nullif(btrim(p_level), ''), 'info');
  v_source text := btrim(coalesce(p_source, ''));
  v_event_name text := btrim(coalesce(p_event_name, ''));
  v_metadata jsonb := p_metadata;
  v_id uuid;
begin
  if v_level not in ('debug', 'info', 'warning', 'error') then
    raise exception 'Invalid diagnostic level';
  end if;

  if v_source = '' then
    raise exception 'Diagnostic source cannot be empty';
  end if;

  if v_event_name = '' then
    raise exception 'Diagnostic event name cannot be empty';
  end if;

  if v_metadata is not null and length(v_metadata::text) > 8000 then
    v_metadata := jsonb_build_object('truncated', true);
  end if;

  insert into public.app_diagnostics (
    user_id,
    level,
    source,
    event_name,
    message,
    metadata,
    url,
    user_agent,
    app_version
  )
  values (
    auth.uid(),
    v_level,
    v_source,
    v_event_name,
    nullif(p_message, ''),
    v_metadata,
    nullif(left(coalesce(p_url, ''), 1000), ''),
    nullif(left(coalesce(p_user_agent, ''), 1000), ''),
    nullif(left(coalesce(p_app_version, ''), 120), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.log_app_diagnostic(text, text, text, text, jsonb, text, text, text) from public;
grant execute on function public.log_app_diagnostic(text, text, text, text, jsonb, text, text, text) to anon, authenticated;
