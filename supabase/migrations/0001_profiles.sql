-- ============================================================================
-- Radar Público — Esquema de perfiles y autenticación
-- Ejecuta este script en: Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

-- 1) Tabla de perfiles, vinculada 1:1 con auth.users ------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  role        text not null default 'user' check (role in ('admin', 'user')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de usuario (1:1 con auth.users). role = admin | user';

-- 2) Función SECURITY DEFINER para comprobar rol admin sin recursión de RLS --
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3) Row Level Security ------------------------------------------------------
alter table public.profiles enable row level security;

-- Lectura: el usuario ve su propio perfil; el admin ve todos.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select
  using (auth.uid() = id or public.is_admin());

-- Inserción: solo tu propia fila (normalmente la crea el trigger).
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert
  with check (auth.uid() = id);

-- Actualización: tu propia fila, o cualquiera si eres admin.
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- 4) Anti-escalada de privilegios -------------------------------------------
-- Un usuario normal no puede cambiarse el rol a sí mismo; solo un admin puede.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role := old.role;  -- se ignora el cambio de rol
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- 5) Auto-creación del perfil al registrarse un usuario ----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 6) Cómo crear el PRIMER administrador
--    (regístrate en la app con tu correo y luego ejecuta esto una vez):
--
--    update public.profiles set role = 'admin'
--    where email = 'tu-correo@ejemplo.com';
-- ============================================================================
