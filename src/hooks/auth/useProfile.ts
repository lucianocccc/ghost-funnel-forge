
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Se il JWT è scaduto, proviamo a fare refresh della sessione
        if (error.code === 'PGRST301') {
          console.log('JWT expired, attempting session refresh...');
          try {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Session refresh failed:', refreshError);
              await supabase.auth.signOut();
              return;
            }
            if (session) {
              console.log('Session refreshed successfully');
              // Retry fetching profile with new session
              setTimeout(() => fetchUserProfile(userId), 100);
              return;
            }
          } catch (refreshError) {
            console.error('Session refresh error:', refreshError);
            await supabase.auth.signOut();
            return;
          }
        }
        
        // Se il profilo non esiste, proviamo a crearlo
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create it...');
          await createUserProfile(userId);
        }
      } else {
        console.log('Profile loaded:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user.user.email,
            first_name: user.user.user_metadata?.first_name || null,
            last_name: user.user.user_metadata?.last_name || null,
            role: 'user' // Default role
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating profile:', error);
        } else {
          console.log('Profile created:', data);
          setProfile(data);
        }
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const clearProfile = () => {
    setProfile(null);
  };

  return {
    profile,
    setProfile,
    fetchUserProfile,
    createUserProfile,
    clearProfile
  };
};
