import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase Client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: window.localStorage,
    },
  }
);

// Membuat Context
const AuthContext = createContext({});

// Custom Hook untuk menggunakan Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Komponen Provider Utama
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // MENGEMBALIKAN LOGIKA TIMEOUT ANDA YANG KRUSIAL
  // ==========================================================
  const fetchUserProfile = React.useCallback(async (userId, currentSession) => {
    // Jika tidak ada user ID atau sesi, proses selesai (pengguna tidak login).
    if (!userId || !currentSession) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Gunakan Promise.race dengan timeout untuk menangani permintaan yang menggantung
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.warn("Profile fetch timeout!");
        controller.abort();
      }, 5000); // Timeout 5 detik

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", userId)
        .abortSignal(controller.signal)
        .single();

      clearTimeout(timeoutId); // Batalkan timeout jika berhasil

      if (error) throw error;

      setUser({
        id: userId,
        email: currentSession.user.email,
        role: profile.role || "user",
        full_name: profile.full_name,
      });
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        error.name === "AbortError" ? "Request timed out" : error
      );
      // Jika profil gagal diambil (termasuk timeout), tetap set user dengan data minimal
      setUser({
        id: userId,
        email: currentSession.user.email,
        role: "user",
        full_name: "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Listener onAuthStateChange adalah satu-satunya sumber kebenaran
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      await fetchUserProfile(session?.user?.id, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]); // Tambahkan fetchUserProfile sebagai dependency

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
      options: { data: userData },
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthHeader: () =>
      session?.access_token ? `Bearer ${session.access_token}` : null,
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
