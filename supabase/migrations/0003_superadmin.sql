-- ============================================================================
-- Radar Público — Super administrador
-- Deja nixonunad@gmail.com como admin de forma durable.
-- Ejecutar DESPUÉS de 0001_profiles.sql, en: Supabase -> SQL Editor -> Run
-- ============================================================================

-- 1) Al registrarse, asignar automáticamente rol 'admin' a este correo.
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
    case when lower(new.email) = 'nixonunad@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2) Si el usuario ya se registró antes, promoverlo ahora.
update public.profiles
set role = 'admin'
where lower(email) = 'nixonunad@gmail.com';
