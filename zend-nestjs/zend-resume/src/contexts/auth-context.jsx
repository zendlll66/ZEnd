"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import loginRequest from "@/service/auth/login";

const AuthContext = createContext(null);
const STORAGE_KEY = "zend.auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          return;
        }
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          setToken(parsed.token);
        }
        if (parsed?.user) {
          setUser(parsed.user);
        }
      } catch (error) {
        console.warn("Failed to parse stored auth session", error);
      }
    };

    restoreSession();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user && token) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, token, isLoading]);

  const login = useCallback(async ({ email, password }) => {
    const response = await loginRequest({ email, password });
    setUser(response?.user ?? null);
    setToken(response?.token ?? null);
    return response;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

