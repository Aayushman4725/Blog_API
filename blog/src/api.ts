// src/api.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/"; // Update with your Django backend URL

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Function to get stored tokens
const getAuthToken = () => localStorage.getItem("access");
const getRefreshToken = () => localStorage.getItem("refresh");

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}user/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem("access", response.data.access); // Store the new access token
          error.config.headers.Authorization = `Bearer ${response.data.access}`; // Retry the request with the new access token
          return axios(error.config); // Retry the original request with the new token
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
interface SignupData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ResetPasswordData {
  email: string;
}

export const signup = (data: SignupData) => api.post("user/signup/", data);
export const login = async (data: LoginData) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await api.post("user/login/", data);
    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh); // Store refresh token as well
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

export const getProfile = async () => {
  try {
    const token = localStorage.getItem("access");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await api.get("user/profile/");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
};

export const resetPassword = (data: ResetPasswordData) =>
  api.post("/user/password-reset/", data);

export const activateAccount = (uid: string, token: string) =>
  api.get(`/user/activate/${uid}/${token}/`);
