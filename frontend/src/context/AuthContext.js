import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, obj = auth
  const [token, setToken] = useState(localStorage.getItem("skl_token") || null);

  useEffect(() => {
    const check = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await api.get("/auth/me", { headers });
        setUser(data);
      } catch {
        setUser(false);
      }
    };
    check();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.token) {
      localStorage.setItem("skl_token", data.token);
      setToken(data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    localStorage.removeItem("skl_token");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
