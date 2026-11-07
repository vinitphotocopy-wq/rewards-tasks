
const SUPABASE_URL = "https://vlyfbdyycjakajyyxdkz.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_axfmRQ4uDoWJEjsP6YVi4w_mOIYnu1L";

// Initialize Supabase
if (!window.supabase) {
  throw new Error("Supabase library load nahi hui. CDN check karo.");
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

// Common error handler
function authError(error) {
  return {
    success: false,
    message: error?.message || "Something went wrong. Please try again."
  };
}

// REGISTER
async function registerUser(name, email, password) {
  try {
    const cleanName = name.trim().slice(0, 30);
    const cleanEmail = email.trim();

    if (!cleanName || !cleanEmail || !password) {
      return {
        success: false,
        message: "Please fill all fields."
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters."
      };
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          display_name: cleanName
        }
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
    if (!email.trim() || !password) {
      return {
        success: false,
        message: "Email and password are required."
      };
    }

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email.trim(),
        password: password
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

    return {
      success: true,
      message: "Logout successful!"
    };

  } catch (error) {
    return authError(error);
  }
}

// GET CURRENT USER
async function getCurrentUser() {
  try {
    const { data, error } =
      await supabaseClient.auth.getUser();

    if (error) {
      return {
        success: false,
        user: null,
        message: error.message
      };
    }

    return {
      success: true,
      user: data.user
    };

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
      return {
        success: false,
        message: "Please enter a display name."
      };
    }

    const { data, error } =
      await supabaseClient.auth.updateUser({
        data: {
          display_name: cleanName
        }
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

// AUTH STATE LISTENER
supabaseClient.auth.onAuthStateChange((event, session) => {
  window.dispatchEvent(
    new CustomEvent("rewardzone-auth-change", {
      detail: {
        event: event,
        user: session?.user || null
      }
    })
  );
});

// GLOBAL FUNCTIONS
window.rewardZoneAuth = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateDisplayName,
  supabaseClient
};

// Backward compatibility for existing index.html
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.updateDisplayName = updateDisplayName;
