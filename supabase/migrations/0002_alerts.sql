-- ============================================================================
-- Radar Público — Alertas / búsquedas guardadas por usuario
-- Ejecutar DESPUÉS de 0001_profiles.sql, en: Supabase -> SQL Editor -> Run
-- ============================================================================

create table if not exists public.alerts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  -- Snapshot de los filtros de búsqueda (SearchFilters) en formato JSON.
  filters     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

comment on table public.alerts is 'Búsquedas/alertas guardadas por usuario (filtros SECOP).';

create index if not exists alerts_user_id_idx on public.alerts (user_id);

-- Row Level Security: cada usuario solo ve y gestiona sus propias alertas -----
alter table public.alerts enable row level security;

drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own" on public.alerts
  for select using (auth.uid() = user_id);

drop policy if exists "alerts_insert_own" on public.alerts;
create policy "alerts_insert_own" on public.alerts
  for insert with check (auth.uid() = user_id);

drop policy if exists "alerts_update_own" on public.alerts;
create policy "alerts_update_own" on public.alerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "alerts_delete_own" on public.alerts;
create policy "alerts_delete_own" on public.alerts
  for delete using (auth.uid() = user_id);
