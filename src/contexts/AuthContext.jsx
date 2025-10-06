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

  async function fetchUserProfile(userId, currentSession) {
    // Jika tidak ada sesi atau user ID, proses selesai. Pengguna tidak login.
    if (!userId || !currentSession) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (error) throw error;

      setUser({
        id: userId,
        email: currentSession.user.email,
        role: profile.role || "user",
        full_name: profile.full_name,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Jika profil gagal diambil, tetap set user dengan data minimal dari sesi
      setUser({
        id: userId,
        email: currentSession.user.email,
        role: "user",
        full_name: "",
      });
    } finally {
      // Pastikan loading selalu di-set ke false setelah selesai
      setLoading(false);
    }
  }

  useEffect(() => {
    // ==========================================================
    // PERBAIKAN UTAMA: Hanya gunakan onAuthStateChange
    // Listener ini akan berjalan saat pertama kali load DAN saat ada perubahan auth
    // ==========================================================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      // Panggil fetchUserProfile dengan sesi yang diterima dari listener
      await fetchUserProfile(session?.user?.id, session);
    });

    // Berhenti mendengarkan saat komponen tidak lagi digunakan
    return () => subscription.unsubscribe();
  }, []); // <-- Dependency array kosong sudah benar

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
