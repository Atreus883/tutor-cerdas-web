// AuthContext.jsx (Versi Perbaikan)
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthContext = createContext({});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // ==========================================================
  // PERUBAHAN UTAMA DI SINI
  // Fungsi ini sekarang menerima 'currentSession' sebagai argumen
  // ==========================================================
  async function fetchUserProfile(userId, currentSession) {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setUser({ id: userId, role: "user" });
      } else {
        setUser({
          id: userId,
          // Gunakan 'currentSession' yang dilewatkan, bukan 'session' dari state
          email: currentSession?.user?.email,
          role: profile.role || "user",
          full_name: profile.full_name,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser({ id: userId, role: "user" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        // Lewatkan sesi yang baru didapat
        fetchUserProfile(initialSession.user.id, initialSession);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        // Lewatkan sesi yang baru dari listener
        await fetchUserProfile(newSession.user.id, newSession);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  function getAuthHeader() {
    return session?.access_token ? `Bearer ${session.access_token}` : null;
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthHeader,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
