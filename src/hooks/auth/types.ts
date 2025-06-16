
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'admin' | 'user';
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}
