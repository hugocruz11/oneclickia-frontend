"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  isLoading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("oneclickia_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }

    setToken(stored);

    api
      .get<User>("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("oneclickia_token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("oneclickia_token");
    setToken(null);
    setUser(null);
    await fetch("/api/auth/set-cookie", { method: "DELETE" });
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
