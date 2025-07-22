
export interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: 'user' | 'admin';
  business_name?: string | null;
  phone?: string | null;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}
