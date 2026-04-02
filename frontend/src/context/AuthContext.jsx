import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { clearStoredToken, getStoredToken } from "../api/client";
import { getCurrentUser, login as loginRequest } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const signIn = useCallback(async (identifier, password) => {
    const result = await loginRequest(identifier, password);
    setUser(result?.user || null);
    return result;
  }, []);

  const signOut = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser || null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const token = getStoredToken();
      if (!token) {
        if (isMounted) {
          setIsAuthLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (_error) {
        clearStoredToken();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      isAuthenticated: Boolean(user),
      userRole: user?.role || "",
      refreshUser,
      signIn,
      signOut,
      updateUser,
    }),
    [isAuthLoading, refreshUser, signIn, signOut, updateUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
