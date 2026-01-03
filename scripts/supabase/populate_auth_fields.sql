-- BEFORE INSERT trigger on auth.users to populate top-level auth fields
-- Copies phone and full_name from user_metadata/raw_user_meta_data into the new auth row
-- Run this in Supabase SQL editor. This runs BEFORE INSERT to avoid recursive updates.

create or replace function auth.populate_auth_user_fields()
returns trigger as $$
begin
  -- Ensure phone column is populated if provided in metadata
  if (NEW.phone is null or NEW.phone = '') then
    NEW.phone := coalesce(
      (NEW.user_metadata ->> 'phone'),
      (NEW.raw_user_meta_data ->> 'phone')
    );
  end if;

  -- Ensure raw_user_meta_data contains a full_name entry
  if NEW.raw_user_meta_data is null then
    NEW.raw_user_meta_data := '{}'::jsonb;
  end if;

  if (NEW.raw_user_meta_data ->> 'full_name') is null then
    NEW.raw_user_meta_data := NEW.raw_user_meta_data || jsonb_build_object(
      'full_name', coalesce(
        (NEW.user_metadata ->> 'full_name'),
        (NEW.user_metadata ->> 'name'),
        (NEW.raw_user_meta_data ->> 'name'),
        NEW.email
      )
    );
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Create the trigger (no-op if already exists)
drop trigger if exists before_auth_user_insert on auth.users;
create trigger before_auth_user_insert
  before insert on auth.users
  for each row execute procedure auth.populate_auth_user_fields();
