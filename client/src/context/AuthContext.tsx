import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Business } from "../types";
import { getMeApi, loginApi, registerApi } from "../services/api";

interface AuthContextType {
  user: User | null;
  business: Business | null;
  token: string | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("gst_auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const savedToken = localStorage.getItem("gst_auth_token");
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getMeApi();
      if (data?.user) {
        setUser(data.user);
        setBusiness(data.user.business || null);
      } else {
        localStorage.removeItem("gst_auth_token");
        setToken(null);
      }
    } catch (err) {
      console.warn("Session expired or invalid:", err);
      localStorage.removeItem("gst_auth_token");
      setToken(null);
      setUser(null);
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email?: string, password?: string) => {
    const data = await loginApi(email, password);
    if (data.token) {
      localStorage.setItem("gst_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setBusiness(data.user.business);
    }
  };

  const register = async (regData: any) => {
    const data = await registerApi(regData);
    if (data.token) {
      localStorage.setItem("gst_auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setBusiness(data.user.business);
    }
  };

  const logout = () => {
    localStorage.removeItem("gst_auth_token");
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
