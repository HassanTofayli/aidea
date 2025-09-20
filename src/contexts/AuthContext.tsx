import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { Profile } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setIsAdmin(profileData.role === 'admin');
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('=== Auth Initialization Debug ===');

        // BYPASS AUTH: Create mock admin user for demo
        const mockUser = {
          id: 'mock-admin-id',
          email: 'admin@demo.com',
          user_metadata: { full_name: 'مدير النظام' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;

        const mockProfile: Profile = {
          id: 'mock-admin-id',
          email: 'admin@demo.com',
          full_name: 'مدير النظام',
          role: 'admin',
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Mock user created:', mockUser);
        console.log('Mock profile created:', mockProfile);

        // Create the mock user profile in the database if it doesn't exist
        try {
          console.log('Checking if mock profile exists in database...');
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', 'mock-admin-id')
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('Mock profile not found, creating it...');
            const { data: createdProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: 'mock-admin-id',
                email: 'admin@demo.com',
                full_name: 'مدير النظام',
                role: 'admin'
              }])
              .select()
              .single();

            if (createError) {
              console.error('Error creating mock profile:', createError);
            } else {
              console.log('Mock profile created successfully:', createdProfile);
            }
          } else if (!fetchError) {
            console.log('Mock profile already exists:', existingProfile);
          } else {
            console.error('Error checking for existing profile:', fetchError);
          }
        } catch (profileError) {
          console.error('Error with profile creation:', profileError);
        }

        // Create a mock session for Supabase to recognize our user
        const mockSession = {
          access_token: 'mock-admin-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        };

        console.log('Setting mock session in Supabase...');

        // Set the session in Supabase client (this will help with RLS)
        await supabase.auth.setSession(mockSession);

        setUser(mockUser);
        setProfile(mockProfile);
        setIsAdmin(true);

        console.log('Auth state set - isAdmin: true with mock session');

        // Comment out real auth for demo
        // const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        // if (error) {
        //   console.error('Error getting session:', error);
        // }
        // if (currentSession) {
        //   setSession(currentSession);
        //   setUser(currentSession.user);
        //   const profileData = await fetchProfile(currentSession.user.id);
        //   if (profileData) {
        //     setProfile(profileData);
        //     setIsAdmin(profileData.role === 'admin');
        //   }
        // }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);

          const profileData = await fetchProfile(currentSession.user.id);
          if (profileData) {
            setProfile(profileData);
            setIsAdmin(profileData.role === 'admin');
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        } else if (event === 'TOKEN_REFRESHED' && currentSession) {
          setSession(currentSession);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      setSession(null);
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAdmin,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};