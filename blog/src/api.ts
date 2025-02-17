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

// Function to set token expiry time
const decodeToken = (token: string | null) => {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};


const setTokenExpiry = (token: string) => {
  const decodedToken = decodeToken(token);
  if (decodedToken && decodedToken.exp) {
    const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
    localStorage.setItem("token_expiry", expiryTime.toString());
  }
};


const getTokenExpiry = () => {
  const expiry = localStorage.getItem("token_expiry");
  return expiry ? Number(expiry) : null;
};

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
  try {
    const response = await api.post("user/login/", data);
    // console.log("Login Response Data:", response.data); // Debugging
    // if (!response.data.access || !response.data.refresh) {
    //   throw new Error("Missing access or refresh token in response");
    // }

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);
    setTokenExpiry(response.data.access);
     // Log the tokens to verify they are stored correctly
     console.log("Access Token:", localStorage.getItem("access"));
     console.log("Refresh Token:", localStorage.getItem("refresh"));
     console.log("Token Expiry:", localStorage.getItem("token_expiry"));

    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


// Function to check if the token is about to expire
const isTokenAboutToExpire = () => {
  const expiryTime = getTokenExpiry();
  if (!expiryTime) return true; // If no expiry, assume expired
  return expiryTime - Date.now() < 60000; // Less than 1 min left
};


// Function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token found");

    const response = await axios.post(`${API_URL}user/token/refresh/`, {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    localStorage.setItem("access", newAccessToken);
    setTokenExpiry(newAccessToken); // Ensure expiry is updated!
    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);

    // Clear tokens if refresh fails
    logout();
    window.location.href = "/login";
    throw error;
  }
};


// Handle token refresh in response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // Retry the original request with the new token
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        console.log("Token removal triggered due to:", error.response?.status);

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("token_expiry");
        window.location.href = "/login"; // Redirect to login page
      }
    }

    return Promise.reject(error);
  }
);

// Periodically check and refresh the token
const startTokenRefreshTimer = () => {
  setInterval(async () => {
    if (isTokenAboutToExpire()) {
      try {
        await refreshToken();
        console.log("Token refreshed successfully");
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }
  }, 60000); // Check every 1 minute
};

// Start the token refresh timer when the app loads
startTokenRefreshTimer();


export const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("token_expiry");
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