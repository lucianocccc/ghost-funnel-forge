
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no data

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Se il JWT è scaduto, proviamo a fare refresh della sessione
        if (error.code === 'PGRST301') {
          console.log('JWT expired, attempting session refresh...');
          try {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Session refresh failed:', refreshError);
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
            return;
          }
        }
        
        // For other errors, try to create the profile
        console.log('Profile fetch failed, attempting to create profile...');
        await createUserProfile(userId);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data);
        setProfile(data);
      } else {
        console.log('No profile found, creating new profile...');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      // Try to create profile as fallback
      await createUserProfile(userId);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      console.log('Creating profile for user:', userId);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('No authenticated user found');
        return;
      }

      const profileData = {
        id: userId,
        email: user.user.email,
        first_name: user.user.user_metadata?.first_name || null,
        last_name: user.user.user_metadata?.last_name || null,
        role: 'user' as const // Default role
      };

      console.log('Inserting profile data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // If profile already exists (unique constraint violation), try to fetch it
        if (error.code === '23505') {
          console.log('Profile already exists, fetching existing profile...');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (fetchError) {
            console.error('Error fetching existing profile:', fetchError);
          } else {
            console.log('Existing profile found:', existingProfile);
            setProfile(existingProfile);
          }
        }
      } else {
        console.log('Profile created successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearProfile = () => {
    console.log('Clearing profile state');
    setProfile(null);
    setLoading(false);
  };

  return {
    profile,
    loading,
    setProfile,
    fetchUserProfile,
    createUserProfile,
    clearProfile
  };
};
