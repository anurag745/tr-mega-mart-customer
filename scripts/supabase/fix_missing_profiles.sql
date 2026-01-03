-- One-time script to create profiles for existing auth.users that lack a public.profiles row.
-- Run this in Supabase SQL editor (Careful: only run once).

INSERT INTO public.profiles (id, name, phone, role, created_at)
SELECT
  u.id,
  coalesce(
    u.user_metadata ->> 'full_name',
    u.user_metadata ->> 'name',
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    u.email
  ) as name,
  coalesce(u.user_metadata ->> 'phone', u.raw_user_meta_data ->> 'phone', null) as phone,
  'admin' as role,
  now() as created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
