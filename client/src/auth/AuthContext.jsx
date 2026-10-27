import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("threadbase-token") || "");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("threadbase-user") || "null");
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || "Unable to sign in");
    localStorage.setItem("threadbase-token", result.token);
    localStorage.setItem("threadbase-user", JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem("threadbase-token");
    localStorage.removeItem("threadbase-user");
    setToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
