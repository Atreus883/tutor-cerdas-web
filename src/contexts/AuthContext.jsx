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
  const [loading, setLoading] = useState(true); // 'loading' HANYA untuk pemeriksaan sesi awal

  useEffect(() => {
    // onAuthStateChange adalah satu-satunya sumber kebenaran.
    // Ia berjalan saat aplikasi pertama kali dimuat (dengan sesi yang tersimpan)
    // DAN setiap kali ada event login, logout, atau pembaruan token.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AUTH EVENT:", event, currentSession);
      setSession(currentSession);

      // Jika ada sesi, ambil profil pengguna.
      if (currentSession?.user) {
        try {
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("role, full_name")
            .eq("id", currentSession.user.id)
            .single();

          if (error) throw error;

          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            role: profile.role || "user",
            full_name: profile.full_name,
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // Jika profil gagal diambil, set user dengan data minimal dari sesi
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email,
            role: "user", // Default role
            full_name: "",
          });
        }
      } else {
        // Jika tidak ada sesi, reset state user
        setUser(null);
      }

      // Selesai memeriksa sesi awal, matikan loading
      setLoading(false);
    });

    // Berhenti mendengarkan saat komponen tidak lagi digunakan
    return () => {
      subscription.unsubscribe();
    };
  }, []); // <-- Array dependensi kosong memastikan ini hanya berjalan sekali

  // Fungsi-fungsi ini sekarang hanya "pemicu".
  // onAuthStateChange yang akan menangani pembaruan state secara otomatis.
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

  // Nilai yang akan disediakan oleh Provider ke seluruh aplikasi
  const value = {
    user,
    session,
    loading, // Tetap sediakan ini untuk ProtectedRoute
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
