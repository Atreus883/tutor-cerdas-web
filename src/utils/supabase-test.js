/**
 * Quick Supabase Database Test
 * Run this in browser console to test database connectivity
 */

// Test 1: Check if supabase client is working
console.log("🔍 Testing Supabase client...");
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase client:", supabase);

// Test 2: Try a simple query to a known table
async function testSupabaseConnection() {
  try {
    console.log("🔍 Testing basic connection...");
    const { data, error } = await supabase
      .from("auth.users")
      .select("id")
      .limit(1);
    console.log("Auth users test:", { data, error });
  } catch (err) {
    console.error("Connection test failed:", err);
  }
}

// Test 3: Check if user_profiles table exists
async function testUserProfilesTable() {
  try {
    console.log("🔍 Testing user_profiles table...");
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);
    console.log("User profiles test:", { data, error });
  } catch (err) {
    console.error("User profiles test failed:", err);
  }
}

// Test 4: Check current user and try direct profile query
async function testCurrentUserProfile() {
  try {
    console.log("🔍 Testing current user profile...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("Current user:", { user, userError });

    if (user) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      console.log("User profile query:", { data, error });
    }
  } catch (err) {
    console.error("Current user profile test failed:", err);
  }
}

// Run all tests
console.log("🚀 Running Supabase tests...");
testSupabaseConnection();
testUserProfilesTable();
testCurrentUserProfile();

// Make functions available globally
window.supabaseTest = {
  testSupabaseConnection,
  testUserProfilesTable,
  testCurrentUserProfile,
};
