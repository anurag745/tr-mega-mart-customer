-- Trigger to copy auth user metadata into public.profiles
-- This function reads name/phone from multiple metadata locations
-- and sets the default role to 'admin'. Run this in Supabase SQL editor.

create or replace function public.handle_new_user()
returns trigger as $$
declare
  full_name text;
  phone text;
begin
  -- Prefer structured user_metadata (set by client on signUp), then raw_user_meta_data (OAuth providers)
  full_name := coalesce(
    new.user_metadata ->> 'full_name',
    new.user_metadata ->> 'name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    new.email
  );

  phone := coalesce(
    new.user_metadata ->> 'phone',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'phone_number'
  );

  insert into public.profiles (id, name, phone, role, created_at)
  values (new.id, full_name, phone, 'admin', now())
  on conflict (id) do update
  set
    name = coalesce(excluded.name, public.profiles.name),
    phone = coalesce(public.profiles.phone, excluded.phone);

  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
