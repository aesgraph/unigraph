import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";
import { addNotification } from "./notificationStore";

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    avatar_url?: string;
    picture?: string;
    name?: string;
  };
}

interface UserStore {
  // Auth state
  isSignedIn: boolean;
  user: User | null;
  isLoading: boolean;

  // Actions
  setSignedIn: (signedIn: boolean) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;

  // Auth methods
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;

  // User details
  getUserDetails: () => User | null;
  getAvatarUrl: () => string | null;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  isSignedIn: false,
  user: null,
  isLoading: true,

  // Basic setters
  setSignedIn: (signedIn: boolean) => set({ isSignedIn: signedIn }),
  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),

  // Initialize auth state
  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          isSignedIn: true,
          user: session.user,
          isLoading: false,
        });
        console.log("UserStore: User authenticated on init:", session.user.id);
      } else {
        set({
          isSignedIn: false,
          user: null,
          isLoading: false,
        });
        console.log("UserStore: No user authenticated on init");
      }

      // Listen for auth changes
      const {
        data: { subscription: _subscription },
      } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
        console.log("UserStore: Auth state change:", event, session?.user?.id);

        const { isSignedIn: wasSignedIn, user: prevUser } = get();

        if (event === "SIGNED_IN" && session?.user) {
          set({
            isSignedIn: true,
            user: session.user,
            isLoading: false,
          });
          console.log("UserStore: User signed in:", session.user.id);

          // Only show notification if this is a new login (not a session refresh)
          if (!wasSignedIn || prevUser?.id !== session.user.id) {
            const userName =
              session.user.user_metadata?.name || session.user.email || "User";
            addNotification({
              message: `Logged in as: ${userName}`,
              type: "success",
              duration: 3000,
            });
          }
        } else if (event === "SIGNED_OUT") {
          set({
            isSignedIn: false,
            user: null,
            isLoading: false,
          });
          console.log("UserStore: User signed out");

          // Show logout notification
          addNotification({
            message: "User logged out",
            type: "info",
            duration: 3000,
          });
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          set({
            user: session.user,
          });
          console.log("UserStore: Token refreshed for user:", session.user.id);
          // Do not show login notification on token refresh
        }
      });

      // Store subscription for cleanup (we'll handle this in a separate method if needed)
      // For now, the subscription will be active for the lifetime of the store
    } catch (error) {
      console.error("UserStore: Error initializing auth:", error);
      set({ isLoading: false });
    }
  },

  // Sign out
  signOut: async () => {
    try {
      console.log("UserStore: Starting sign out process...");

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("UserStore: Supabase sign out error:", error);
        throw error;
      }

      // Clear local state
      set({
        isSignedIn: false,
        user: null,
      });

      // Clear any Supabase-related local storage
      try {
        // Clear Supabase auth tokens from localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes("supabase")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));

        // Also clear sessionStorage
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.includes("supabase")) {
            sessionKeysToRemove.push(key);
          }
        }
        sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));

        console.log("UserStore: Cleared local storage and session storage");
      } catch (storageError) {
        console.warn("UserStore: Error clearing storage:", storageError);
        // Don't throw here, as the main sign out was successful
      }

      // Verify logout was successful
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.warn(
          "UserStore: Session still exists after logout, attempting to clear again"
        );
        // Try one more time
        await supabase.auth.signOut();
      } else {
        console.log("UserStore: Logout verified - no active session found");
      }

      console.log("UserStore: User signed out successfully");
    } catch (error) {
      console.error("UserStore: Error signing out:", error);
      throw error;
    }
  },

  // Check if user is still authenticated (for debugging)
  checkAuthStatus: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        "UserStore: Current auth status - Session exists:",
        !!session
      );
      if (session) {
        console.log("UserStore: Session user ID:", session.user.id);
      }
      return !!session;
    } catch (error) {
      console.error("UserStore: Error checking auth status:", error);
      return false;
    }
  },

  // Get user details
  getUserDetails: () => {
    return get().user;
  },

  // Get avatar URL with fallbacks
  getAvatarUrl: () => {
    const user = get().user;
    if (!user) return null;

    return (
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null
    );
  },
}));
