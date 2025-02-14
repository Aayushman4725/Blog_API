import React, { createContext, useContext, useState, useEffect } from "react";
import { login, logout, getProfile } from "../api"; // Make sure getProfile is available in your API
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  loginUser: (data: any) => Promise<void>;
  logoutUser: () => void;
  profile: any;  // Store the profile in context
  setProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);  // Profile state
  const navigate = useNavigate();

  // Check if user is authenticated on initial load (on page reload)
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      // If token exists, fetch the user profile and set the authentication state
      getProfile()
        .then((profileResponse) => {
          setProfile(profileResponse);
          setUser(profileResponse);
          setIsAuthenticated(true);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
          setError("Failed to fetch user profile.");
        });
    }
  }, []);

  const loginUser = async (data: any) => {
    try {
      const response = await login(data);
      console.log("Login Response: ", response);
      
      localStorage.setItem("access", response.data.token.access);
      localStorage.setItem("refresh", response.data.token.refresh);
      setUser(response.data);
      setIsAuthenticated(true);

      const profileResponse = await getProfile();
      console.log("Profile Response: ", profileResponse);  // Log the profile response
      setProfile(profileResponse);  // Set the profile in state

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed");
    }
  };

  const logoutUser = () => {
    logout();
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    setIsAuthenticated(false);
    setProfile(null);  // Reset profile on logout
    setError(null);
    navigate("/login");  // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, error, setError, loginUser, logoutUser, profile, setProfile }}>
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
