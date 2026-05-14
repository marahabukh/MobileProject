import React, { createContext, useContext, useEffect, useState } from "react";
import { getSecurely, deleteSecurely } from "../lib/SecureStorage";
import { logoutUser } from "../api/UserServices";

type User = {
  uid: string;
  email: string | null;
  displayName: string;
  name: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  setUser: (user: User) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getSecurely("user_session");
        if (session) {
          setUser(session);
        }
      } catch (error) {
        console.error("Failed to load auth session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
