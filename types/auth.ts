import { Session } from '@supabase/supabase-js';

export type CustomerUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  session?: Session | undefined;
};
