import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
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
  // 'loading' HANYA untuk pemeriksaan sesi awal saat aplikasi pertama kali dimuat.
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // LOGIKA TIMEOUT ANDA KITA SIMPAN DI SINI
  // Fungsi ini stabil karena dibungkus dengan useCallback.
  // ==========================================================
  const fetchUserProfile = useCallback(async (userId, currentSession) => {
    // Jika tidak ada user ID atau sesi, kembalikan null.
    if (!userId || !currentSession) {
      return null;
    }

    try {
      // Gunakan Promise.race dengan timeout untuk menangani permintaan yang menggantung.
      const controller = new AbortController();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          controller.abort();
          reject(new Error("Profile fetch timed out"));
        }, 5000) // Timeout 5 detik
      );

      const profilePromise = supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", userId)
        .abortSignal(controller.signal)
        .single();
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) throw error;
      
      // Jika berhasil, kembalikan objek user yang lengkap.
      return {
        id: userId,
        email: currentSession.user.email,
        role: profile.role || "user",
        full_name: profile.full_name,
      };

    } catch (error) {
      console.error("Error/Timeout fetching user profile:", error);
      // Jika gagal (termasuk timeout), kembalikan objek user default.
      return {
        id: userId,
        email: currentSession.user.email,
        role: "user",
        full_name: "",
      };
    }
  }, []);


  // ==========================================================
  // INI ADALAH INTI DARI SEMUA LOGIKA SESI
  // Hanya menggunakan onAuthStateChange sebagai satu-satunya sumber kebenaran.
  // ==========================================================
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("AUTH EVENT:", event);
        setSession(currentSession);

        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id, currentSession);
          setUser(userProfile);
        } else {
          setUser(null);
        }
        
        // Selesai memeriksa sesi awal, matikan loading.
        setLoading(false);
      }
    );

    // Berhenti mendengarkan saat komponen tidak lagi digunakan.
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);


  // Fungsi-fungsi ini sekarang HANYA pemicu. onAuthStateChange yang akan menangani hasilnya.
  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password, userData = {}) {
    return supabase.auth.signUp({ email, password, options: { data: userData } });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }


  // Nilai yang akan disediakan oleh Provider ke seluruh aplikasi
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    getAuthHeader: () => (session?.access_token ? `Bearer ${session.access_token}` : null),
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}