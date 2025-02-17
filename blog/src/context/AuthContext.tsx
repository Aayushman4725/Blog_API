import React, { createContext, useContext, useState, useEffect } from "react";
import { login, logout, getProfile } from "../api";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  loginUser: (data: any) => Promise<void>;
  logoutUser: () => void;
  profile: any;
  setProfile: (profile: any) => void;
  updateProfile: (updatedProfile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const isAuthenticated = Boolean(localStorage.getItem("access")); // Derive state instead of using useState


    useEffect(() => {
      if (isAuthenticated) {
        getProfile()
          .then((profileResponse) => {
            setProfile(profileResponse);
            console.log("Profile Data:", profileResponse);
          })
          .catch((error) => {
            console.error("Error fetching profile:", error);
            setError("Failed to fetch user profile.");
          });
      }
    }, [isAuthenticated]);
  const loginUser = async (data: any) => {
    try {
      const response = await login(data);
      const { access, refresh } = response.data.token;

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const profileResponse = await getProfile();
      setProfile(profileResponse);

      navigate("/dashboard");
    } catch {
      setError("Login failed");
    }
  };

  const logoutUser = () => {
    logout();
    localStorage.clear();
    setProfile(null);
    setError(null);
    navigate("/login");
  };

  const updateProfile = (updatedProfile: any) => {
    setProfile((prev) => ({ ...prev, ...updatedProfile }));
  };

  return (
    <AuthContext.Provider
      value={{
        user: profile, // No need for separate user state
        isAuthenticated,
        error,
        setError,
        loginUser,
        logoutUser,
        profile,
        setProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
