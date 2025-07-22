
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('Profile fetch already in progress, skipping...');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Handle specific error cases
        if (error.code === 'PGRST301') {
          console.log('JWT expired, attempting session refresh...');
          try {
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error('Session refresh failed:', refreshError);
              setLoading(false);
              return;
            }
            if (session) {
              console.log('Session refreshed, retrying profile fetch...');
              // Retry the profile fetch
              const { data: retryData, error: retryError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
              
              if (!retryError && retryData) {
                console.log('Profile loaded after refresh:', retryData);
                setProfile(retryData);
                setLoading(false);
                return;
              }
            }
          } catch (refreshError) {
            console.error('Session refresh error:', refreshError);
          }
        }
        
        // Only create profile if it's genuinely missing
        if (error.code === 'PGRST116' || error.message.includes('No rows returned')) {
          console.log('Profile not found, creating new profile...');
          await createUserProfile(userId);
        } else {
          console.error('Unexpected profile fetch error:', error);
        }
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', { id: data.id, email: data.email, role: data.role });
        setProfile(data);
      } else {
        console.log('No profile data returned, creating new profile...');
        await createUserProfile(userId);
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const createUserProfile = async (userId: string) => {
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

      console.log('Inserting profile data:', { id: profileData.id, email: profileData.email });

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        
        // If profile already exists, fetch it
        if (error.code === '23505') {
          console.log('Profile already exists, fetching...');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
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
