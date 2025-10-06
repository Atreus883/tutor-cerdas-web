/**
 * Debugging utilities for authentication issues
 */

export function logSupabaseState() {
  console.group("🔍 Supabase Auth Debug");

  // Check localStorage
  const localStorageKeys = Object.keys(localStorage).filter(
    (key) => key.includes("supabase") || key.includes("auth")
  );

  console.log("📦 LocalStorage Auth Keys:", localStorageKeys);

  localStorageKeys.forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, JSON.parse(value || "{}"));
    } catch (e) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  });

  // Check sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage).filter(
    (key) => key.includes("supabase") || key.includes("auth")
  );

  console.log("📦 SessionStorage Auth Keys:", sessionStorageKeys);

  // Check cookies
  const cookies = document.cookie
    .split(";")
    .filter((cookie) => cookie.includes("supabase") || cookie.includes("auth"));

  console.log("🍪 Auth Cookies:", cookies);

  console.groupEnd();
}

export function clearSupabaseStorage() {
  console.log("🧹 Clearing all Supabase storage...");

  // Clear localStorage
  Object.keys(localStorage)
    .filter((key) => key.includes("supabase"))
    .forEach((key) => {
      console.log(`Removing localStorage: ${key}`);
      localStorage.removeItem(key);
    });

  // Clear sessionStorage
  Object.keys(sessionStorage)
    .filter((key) => key.includes("supabase"))
    .forEach((key) => {
      console.log(`Removing sessionStorage: ${key}`);
      sessionStorage.removeItem(key);
    });

  console.log("✅ Storage cleared");
}

// Add to window for easy debugging in browser console
if (typeof window !== "undefined") {
  window.authDebug = {
    logSupabaseState,
    clearSupabaseStorage,
  };

  console.log("🔧 Auth debugging tools available as window.authDebug");
}
