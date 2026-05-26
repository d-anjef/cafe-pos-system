import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOGIN ---------------- */
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  /* ---------------- REGISTER (NEW) ---------------- */
  const register = async (organizationName, name, email, password) => {
    try {
      const res = await api.post("/auth/register", {
        organizationName,
        name,
        email,
        password
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  /* ---------------- FETCH USER ---------------- */
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to use saved user first (for faster UI)
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (e) {
          console.error("Error parsing saved user:", e);
        }
      }

      // Verify with server (silently handle errors)
      try {
        const res = await api.get("/auth/me");

        if (res.data.success || res.data.user) {
          const userData = res.data.user || res.data;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      } catch (verifyError) {
        // If 401, token is invalid - clear auth
        if (verifyError.response?.status === 401) {
          console.log("Token invalid, clearing auth...");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
        // Other errors: keep saved user if exists (offline mode)
      }
    } catch (err) {
      console.error("Fetch user error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  /* ---------------- UPDATE USER (for profile changes) ---------------- */
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      loading,
      updateUser,
      refetchUser: fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);