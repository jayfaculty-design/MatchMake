import axios from "axios";
import { createContext, useState, type PropsWithChildren } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/auth/register", {
        email,
        password,
      });
      console.log("User registered", response.data);
      setTeam(response.data.team);
      localStorage.setItem("token", response.data.token);
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error("Registration Failed", error);
      return {
        success: false,
        message: error.response?.data.message || "Someth went wrong",
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setTeam(res.data.team);
      console.log("Logged In team", res.data.team);
      return {
        success: true,
        message: res.data.message,
      };
    } catch (error: any) {
      console.error("Error occured, something went wrong", error);
      const errorMessage = error.response?.data?.message || "Login Failed";
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.removeItem("token");
      setTeam(null);
      return {
        success: true,
        message: res.data.message,
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      const errorMessage = error.response?.data?.message || "Logout errror";
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthContext.Provider value={{ login, team, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
