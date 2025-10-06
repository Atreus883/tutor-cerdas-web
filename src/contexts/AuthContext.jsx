// AuthContext.jsx (Versi Perbaikan Final)
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
  // PERUBAHAN UTAMA: Fungsi ini sekarang menerima 'currentSession' sebagai argumen
  // untuk menghindari 'stale state'.
  // ==========================================================
  async function fetchUserProfile(userId, currentSession) {
    // Jika tidak ada sesi yang valid, hentikan proses
    if (!currentSession) {
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

      if (error) {
        console.error("Error fetching profile:", error);
        // Tetap set user dengan data minimal dari sesi
        setUser({
          id: userId,
          email: currentSession.user.email,
          role: "user",
        });
      } else {
        setUser({
          id: userId,
          // Gunakan 'currentSession' yang dilewatkan, bukan 'session' dari state
          email: currentSession.user.email,
          role: profile.role || "user",
          full_name: profile.full_name,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser({
        id: userId,
        email: currentSession.user.email,
        role: "user",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 1. Ambil sesi awal saat aplikasi dimuat
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      // Panggil fetchUserProfile dengan sesi yang baru didapat
      fetchUserProfile(initialSession?.user?.id, initialSession);
    });

    // 2. Dengarkan perubahan status autentikasi (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      // Panggil fetchUserProfile dengan sesi baru dari listener
      await fetchUserProfile(newSession?.user?.id, newSession);
    });

    // Berhenti mendengarkan saat komponen dilepas
    return () => subscription.unsubscribe();
  }, []); // <-- Dependency array kosong sudah benar

  // ... sisa fungsi (signIn, signUp, signOut) tetap sama ...
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
