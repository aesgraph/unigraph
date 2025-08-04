import { useUserStore } from "../store/userStore";

export function useAuth() {
  const {
    isSignedIn,
    user,
    isLoading,
    initializeAuth,
    signOut,
    checkAuthStatus,
    getUserDetails,
    getAvatarUrl,
  } = useUserStore();

  return {
    // State
    isSignedIn,
    user,
    isLoading,

    // Actions
    initializeAuth,
    signOut,
    checkAuthStatus,
    getUserDetails,
    getAvatarUrl,
  };
}
