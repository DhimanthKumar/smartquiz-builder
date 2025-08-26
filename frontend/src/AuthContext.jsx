import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}0/api/token`, {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Fetch profile after login
      const profileRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}0/api/profile`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const { username: uname, role, enrolled_courses } = profileRes.data;
      const userData = {
        username: uname,
        typeofrole: role,
        coursesEnrolled: role === "student" ? enrolled_courses : [],
      };

      setUser(userData);
      return true;
    } catch (error) {
      console.error("Login or profile fetch failed:", error);
      logout();
      return false;
    }
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem("refresh") &&
          user // Only try to refresh if user is actually logged in
        ) {
          originalRequest._retry = true;
          try {
            const refreshRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}0/api/token/refresh`, {
              refresh: localStorage.getItem("refresh"),
            });

            const newAccess = refreshRes.data.access;
            localStorage.setItem("access", newAccess);
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

            return axios(originalRequest);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [user]); // Add user as dependency

  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");

      // If no tokens, user is not logged in
      if (!access || !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}0/api/profile`, {
          headers: { Authorization: `Bearer ${access}` },
        });

        const { username, role, enrolled_courses } = res.data;
        setUser({
          username,
          typeofrole: role,
          coursesEnrolled: role === "student" ? enrolled_courses : [],
        });
      } catch (err) {
        console.error("Failed to fetch profile on mount", err);
        
        // If profile fetch fails with 401, try to refresh token once
        if (err.response?.status === 401 && refresh) {
          try {
            const refreshRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}0/api/token/refresh`, {
              refresh,
            });

            const newAccess = refreshRes.data.access;
            localStorage.setItem("access", newAccess);

            // Try fetching profile again with new token
            const profileRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}0/api/profile`, {
              headers: { Authorization: `Bearer ${newAccess}` },
            });

            const { username, role, enrolled_courses } = profileRes.data;
            setUser({
              username,
              typeofrole: role,
              coursesEnrolled: role === "student" ? enrolled_courses : [],
            });
          } catch (refreshError) {
            console.error("Token refresh failed during initialization:", refreshError);
            logout(); // Clear invalid tokens
          }
        } else {
          logout(); // Clear invalid tokens
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once on mount

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}