import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
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

  const fetchUserProfile = useCallback(async (userId, currentSession) => {
    if (!userId || !currentSession) return null;
    try {
      const controller = new AbortController();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
          controller.abort();
          reject(new Error("Profile fetch timed out"));
        }, 5000)
      );
      const profilePromise = supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", userId)
        .abortSignal(controller.signal)
        .single();
      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise,
      ]);
      if (error) throw error;
      return {
        id: userId,
        email: currentSession.user.email,
        role: profile.role || "user",
        full_name: profile.full_name,
      };
    } catch (error) {
      console.error("Error/Timeout fetching user profile:", error);
      return {
        id: userId,
        email: currentSession.user.email,
        role: "user",
        full_name: "",
      };
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const userProfile = await fetchUserProfile(
        currentSession?.user?.id,
        currentSession
      );
      setUser(userProfile);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // ==========================================================
  // FUNGSI BARU YANG DITAMBAHKAN UNTUK PANGGILAN API YANG AMAN
  // ==========================================================
  const fetchWithAuth = useCallback(
    async (path, opts = {}) => {
      const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
      const authHeader = session?.access_token
        ? `Bearer ${session.access_token}`
        : null;

      const headers = { ...opts.headers };
      if (!opts.body || typeof opts.body === "string") {
        headers["Content-Type"] = "application/json";
      }
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch(`${apiBase}${path}`, { ...opts, headers });

      if (response.status === 401) {
        await signOut();
        throw new Error("Session expired or invalid. Please log in again.");
      }

      const text = await response.text();
      let body;
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { raw: text };
      }

      if (!response.ok) {
        throw new Error(
          body?.error || body?.message || `HTTP error ${response.status}`
        );
      }

      return body;
    },
    [session]
  ); // Bergantung pada 'session' agar selalu dapat token terbaru

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signUp(email, password, userData = {}) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    fetchWithAuth, // <-- Ekspor fungsi baru ini
    isAdmin: user?.role === "admin",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
