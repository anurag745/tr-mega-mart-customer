
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';


import { CustomerUser } from '../types/auth';

interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const u = data.session.user;
        setUser({
          id: u.id,
          email: u.email ?? '',
          name: u.user_metadata?.name,
          role: u.role,
          session: data.session,
        });
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name,
          role: session.user.role,
          session,
        });
      } else {
        setUser(null);
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let errorMsg = error.message;
        // Add more details if available (some AuthError fields are optional)
        const errAny = error as any;
        if (errAny.details) {
          errorMsg += `\nDetails: ${errAny.details}`;
        }
        if (errAny.hint) {
          errorMsg += `\nHint: ${errAny.hint}`;
        }
        if (errAny.code) {
          errorMsg += `\nCode: ${errAny.code}`;
        }
        // Optionally log to a remote service or show a more helpful message
        return { success: false, error: errorMsg };
      }
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.name,
          role: data.user.role,
          session: data.session,
        });
        return { success: true };
      }
      return { success: false, error: 'No user returned' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) return { success: false, error: error.message };
      // On mobile, handle redirect manually if needed
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signup = async (email: string, password: string, name?: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, full_name: name, phone, role: 'customer', source: 'mobile-app'  },
        },
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? '',
          name: data.user.user_metadata?.name,
          role: 'customer',
          session: data.session ?? undefined,
        });
        return { success: true };
      }
      return { success: false, error: 'No user returned' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }
  return context;
};
