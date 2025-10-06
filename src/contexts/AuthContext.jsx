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
  // PERBAIKAN FINAL: Fungsi ini sekarang menerima 'currentSession' sebagai argumen
  // untuk secara definitif menyelesaikan masalah 'stale state'.
  // ==========================================================
  async function fetchUserProfile(userId, currentSession) {
    // Jika tidak ada user ID atau sesi, proses autentikasi selesai (pengguna tidak login).
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

      if (error) {
        console.error("Error fetching profile:", error);
        // Jika profil tidak ditemukan, tetap set user dengan data minimal dari sesi.
        setUser({
          id: userId,
          email: currentSession.user.email,
          role: "user", // Default role
          full_name: "",
        });
      } else {
        // Jika profil ditemukan, set user dengan data lengkap.
        setUser({
          id: userId,
          // Gunakan 'currentSession' yang dilewatkan, bukan 'session' dari state.
          email: currentSession.user.email,
          role: profile.role || "user",
          full_name: profile.full_name,
        });
      }
    } catch (error) {
      console.error("Error during fetchUserProfile:", error);
      // Tangani error tak terduga
      setUser({
        id: userId,
        email: currentSession.user.email,
        role: "user",
        full_name: "",
      });
    } finally {
      // Pastikan loading selalu di-set ke false setelah selesai.
      setLoading(false);
    }
  }

  useEffect(() => {
    // Ambil sesi awal saat aplikasi pertama kali dimuat.
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      // PERBAIKAN: Lewatkan sesi yang baru didapat ke fetchUserProfile.
      fetchUserProfile(initialSession?.user?.id, initialSession);
    });

    // Dengarkan perubahan status autentikasi (misal: login, logout).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      // PERBAIKAN: Lewatkan sesi baru dari listener ke fetchUserProfile.
      await fetchUserProfile(newSession?.user?.id, newSession);
    });

    // Berhenti mendengarkan saat komponen tidak lagi digunakan.
    return () => subscription.unsubscribe();
  }, []); // <-- Dependency array kosong sudah benar, ini hanya berjalan sekali saat komponen mount.

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

  // Kembalikan ke children agar tidak menyebabkan layar putih.
  // Tugas menyembunyikan konten adalah milik ProtectedRoute.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
