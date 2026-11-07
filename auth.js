
const SUPABASE_URL = "https://vlyfbdyycjakajyyxdkz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_axfmRQ4uDoWJEjsP6YVi4w_mOIYnu1L";

if (!window.supabase) {
  throw new Error("Supabase library load nahi hui.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

function authError(error) {
  return {
    success: false,
    message: error?.message || "Something went wrong."
  };
}

// REGISTER
async function registerUser(name, email, password) {
  try {
    const cleanName = name.trim().slice(0, 30);

    if (!cleanName || !email.trim() || !password) {
      return { success: false, message: "Please fill all fields." };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters."
      };
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: cleanName }
      }
    });

    if (error) return authError(error);

    return {
      success: true,
      user: data.user,
      message: data.session
        ? "Registration successful!"
        : "Account created. Please verify your email."
    };
  } catch (error) {
    return authError(error);
  }
}

// LOGIN
async function loginUser(email, password) {
  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password
      });

    if (error) return authError(error);

    return {
      success: true,
      user: data.user,
      message: "Login successful!"
    };
  } catch (error) {
    return authError(error);
  }
}

// LOGOUT
async function logoutUser() {
  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) return authError(error);

    return { success: true, message: "Logout successful!" };
  } catch (error) {
    return authError(error);
  }
}

// GET CURRENT USER
async function getCurrentUser() {
  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
      return { success: false, user: null, message: error.message };
    }

    return { success: true, user: data.user };
  } catch (error) {
    return {
      success: false,
      user: null,
      message: error.message
    };
  }
}

// UPDATE DISPLAY NAME
async function updateDisplayName(name) {
  try {
    const cleanName = name.trim().slice(0, 30);

    if (!cleanName) {
      return { success: false, message: "Enter a display name." };
    }

    const { data, error } = await supabaseClient.auth.updateUser({
      data: { display_name: cleanName }
    });

    if (error) return authError(error);

    return {
      success: true,
      user: data.user,
      message: "Display name updated!"
    };
  } catch (error) {
    return authError(error);
  }
}

// LOAD USER PROGRESS
async function loadUserProgress() {
  try {
    const { data: authData, error: authErrorResult } =
      await supabaseClient.auth.getUser();

    if (authErrorResult) return authError(authErrorResult);

    const user = authData.user;

    if (!user) {
      return { success: false, message: "Please login first." };
    }

    const { data, error } = await supabaseClient
      .from("user_progress")
      .select("points, completed_tasks")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return authError(error);

    // Create a default record for a new user
    if (!data) {
      const { data: newData, error: insertError } =
        await supabaseClient
          .from("user_progress")
          .insert({
            user_id: user.id,
            points: 0,
            completed_tasks: []
          })
          .select("points, completed_tasks")
          .single();

      if (insertError) return authError(insertError);

      return {
        success: true,
        progress: newData
      };
    }

    return {
      success: true,
      progress: data
    };
  } catch (error) {
    return authError(error);
  }
}

// SAVE USER PROGRESS
async function saveUserProgress(points, completedTasks) {
  try {
    const { data: authData, error: authErrorResult } =
      await supabaseClient.auth.getUser();

    if (authErrorResult) return authError(authErrorResult);

    const user = authData.user;

    if (!user) {
      return { success: false, message: "Please login first." };
    }

    if (
      !Number.isSafeInteger(points) ||
      points < 0 ||
      !Array.isArray(completedTasks) ||
      !completedTasks.every(task => typeof task === "string")
    ) {
      return {
        success: false,
        message: "Invalid progress data."
      };
    }

    const { data, error } = await supabaseClient
      .from("user_progress")
      .upsert({
        user_id: user.id,
        points,
        completed_tasks: completedTasks,
        updated_at: new Date().toISOString()
      })
      .select("points, completed_tasks")
      .single();

    if (error) return authError(error);

    return {
      success: true,
      progress: data,
      message: "Progress saved!"
    };
  } catch (error) {
    return authError(error);
  }
}

// AUTH STATE LISTENER
supabaseClient.auth.onAuthStateChange((event, session) => {
  window.dispatchEvent(
    new CustomEvent("rewardzone-auth-change", {
      detail: {
        event,
        user: session?.user || null
      }
    })
  );
});

// GLOBAL EXPORTS
window.rewardZoneAuth = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateDisplayName,
  loadUserProgress,
  saveUserProgress,
  supabaseClient
};

window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.updateDisplayName = updateDisplayName;
