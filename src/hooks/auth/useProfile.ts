
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent multiple simultaneous calls
    if (fetching || loading) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }

    try {
      setFetching(true);
      setLoading(true);
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Handle JWT expiration with limited retries
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
              // Single retry after refresh
              const { data: retryData, error: retryError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
              
              if (!retryError && retryData) {
                console.log('Profile loaded after refresh:', retryData);
                setProfile(retryData);
                return;
              }
            }
          } catch (refreshError) {
            console.error('Session refresh error:', refreshError);
          }
        }
        
        // Only try to create profile if it's a genuine "not found" situation
        if (error.code === 'PGRST116' || error.message.includes('No rows returned')) {
          console.log('Profile not found, creating new profile...');
          await createUserProfile(userId);
        }
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
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [fetching, loading]);

  const createUserProfile = async (userId: string) => {
    // Prevent duplicate creation attempts
    if (fetching) {
      console.log('Profile creation already in progress, skipping...');
      return;
    }

    try {
      console.log('Creating profile for user:', userId);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('No authenticated user found for profile creation');
        return;
      }

      const profileData = {
        id: userId,
        email: user.user.email,
        first_name: user.user.user_metadata?.first_name || null,
        last_name: user.user.user_metadata?.last_name || null,
        role: 'user' as const
      };

      console.log('Inserting profile data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        
        // If profile already exists, fetch it instead of creating another
        if (error.code === '23505') {
          console.log('Profile already exists, fetching existing profile...');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (!fetchError && existingProfile) {
            console.log('Existing profile found:', existingProfile);
            setProfile(existingProfile);
          }
        }
      } else if (data) {
        console.log('Profile created successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error creating profile:', error);
    }
  };

  const clearProfile = useCallback(() => {
    console.log('Clearing profile state');
    setProfile(null);
    setLoading(false);
    setFetching(false);
  }, []);

  return {
    profile,
    loading,
    setProfile,
    fetchUserProfile,
    createUserProfile,
    clearProfile
  };
};
