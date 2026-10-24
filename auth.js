
const SUPABASE_URL = "https://vlyfbdyycjakajyyxdkz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_axfmRQ4uDoWJEjsP6YVi4w_mOIYnu1L";

if (!window.supabase) {
  throw new Error("Supabase library load nahi hui.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

async function registerUser(name, email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { display_name: name.trim().slice(0, 30) }
    }
  });

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: data.session
      ? "Registration successful!"
      : "Account bana. Email confirmation check karo.",
    user: data.user
  };
}

async function loginUser(email, password) {
  const { data, error } = await supabaseClient.auth
    .signInWithPassword({
      email: email.trim(),
      password
    });

  if (error) return { success: false, message: error.message };

  return {
    success: true,
    message: "Login successful!",
    user: data.user
  };
}

async function logoutUser() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) return { success: false, message: error.message };

  return { success: true, message: "Logout successful!" };
}

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) return { success: false, user: null };

  return { success: true, user: data.user };
}

// Update the logged-in user's display name
async function updateDisplayName(name) {
  const cleanName = name.trim().slice(0, 30);

  if (!cleanName) {
    return {
      success: false,
      message: "Please enter a display name."
    };
  }

  const { data, error } = await supabaseClient.auth.updateUser({
    data: { display_name: cleanName }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    user: data.user,
    message: "Display name updated!"
  };
}

window.rewardZoneAuth = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateDisplayName,
  supabaseClient
};
