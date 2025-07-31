import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token", {
        username,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // Fetch profile after login
      const profileRes = await axios.get("http://127.0.0.1:8000/api/profile", {
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
          localStorage.getItem("refresh")
        ) {
          originalRequest._retry = true;
          try {
            const refreshRes = await axios.post("http://127.0.0.1:8000/api/token/refresh", {
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
  }, []);

  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (access && refresh) {
      axios
        .get("http://127.0.0.1:8000/api/profile", {
          headers: { Authorization: `Bearer ${access}` },
        })
        .then((res) => {
          const { username, role, enrolled_courses } = res.data;
          setUser({
            username,
            typeofrole: role,
            coursesEnrolled: role === "student" ? enrolled_courses : [],
          });
        })
        .catch((err) => {
          console.error("Failed to fetch profile on mount", err);
          logout();
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
