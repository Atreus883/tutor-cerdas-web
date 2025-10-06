import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Import debug utilities for development
if (import.meta.env.DEV) {
  import("../utils/auth-debug.js");
  import("../utils/supabase-test.js");
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: window.localStorage,
      detectSessionInUrl: false, // Disable if you're not using OAuth redirects
    },
  }
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

  // Create a stable reference for fetchUserProfile
  const fetchUserProfile = React.useCallback(async (userId, currentSession) => {
    try {
      console.log("AuthProvider: Fetching profile for:", userId);

      // Use Promise.race with timeout to catch hanging queries
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 5 second timeout

      const profilePromise = supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", userId)
        .abortSignal(controller.signal)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 1000)
      );

      const { data: profile, error } = await Promise.race([
        profilePromise,
        timeoutPromise,
      ]);

      clearTimeout(timeoutId);

      if (error) {
        console.error("AuthProvider: Profile fetch error:", error);
        console.error("AuthProvider: Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // If error 401/403, session might be expired
        if (error.code === "PGRST301" || error.message?.includes("JWT")) {
          console.log("AuthProvider: Session expired, signing out...");
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        // Check if it's a "no rows returned" error (user profile doesn't exist)
        if (error.code === "PGRST116") {
          console.log(
            "AuthProvider: No profile found, creating default user..."
          );
          setUser({
            id: userId,
            email: currentSession?.user?.email,
            role: "user",
          });
          setLoading(false);
          return;
        }

        // Fallback: set default user without profile
        console.log("AuthProvider: Using fallback user due to error");
        setUser({
          id: userId,
          email: currentSession?.user?.email,
          role: "user",
        });
      } else {
        console.log("AuthProvider: Profile fetched successfully:", profile);
        setUser({
          id: userId,
          email: currentSession?.user?.email,
          role: profile?.role || "user",
          full_name: profile?.full_name,
        });
      }
    } catch (error) {
      console.error("AuthProvider: Profile fetch exception:", error);

      // If AbortError or timeout, use fallback
      if (
        error.name === "AbortError" ||
        error.message === "Profile fetch timeout"
      ) {
        console.log(
          "AuthProvider: Profile fetch timeout/abort, using fallback..."
        );
      }

      // Always set user to prevent stuck loading
      console.log("AuthProvider: Setting fallback user due to exception");
      setUser({
        id: userId,
        email: currentSession?.user?.email,
        role: "user",
      });
    } finally {
      console.log("AuthProvider: Setting loading to false");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    console.log("AuthProvider: Starting initialization...");

    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("AuthProvider: Session error:", error);
          if (isMounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log("AuthProvider: Initial session:", session);

        if (isMounted) {
          setSession(session);

          if (session?.user) {
            await fetchUserProfile(session.user.id, session);
          } else {
            console.log("AuthProvider: No session, setting loading to false");
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("AuthProvider: Init error:", error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set a fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log("AuthProvider: Fallback timeout - setting loading to false");
      setLoading(false);
    }, 10000); // 10 seconds fallback

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: Auth state change:", event, session);

      if (!isMounted) return;

      setSession(session);

      if (session?.user) {
        await fetchUserProfile(session.user.id, session);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  async function signIn(email, password) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } finally {
      // Loading will be set to false by onAuthStateChange
    }
  }

  async function signUp(email, password, userData = {}) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return data;
    } finally {
      // Loading will be set to false by onAuthStateChange
    }
  }

  async function signOut() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
    }
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
