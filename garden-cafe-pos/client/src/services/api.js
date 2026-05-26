import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

/* ---------------- AUTO ATTACH TOKEN ---------------- */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ---------------- HANDLE RESPONSE ERRORS ---------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log error if it's NOT a 401 from /auth/me (silent token check)
    if (!(error.config?.url?.includes('/auth/me') && error.response?.status === 401)) {
      console.error('API Error:', error.response?.data?.message || error.message);
    }

    // Handle timeout (cold start / server slow)
    if (error.code === 'ECONNABORTED') {
      error.message = 'Server is taking too long to respond. Please try again.';
    }

    // Handle network errors (server not running)
    if (!error.response) {
      error.message = 'Cannot reach server — is your backend running on port 5000?';
    }

    return Promise.reject(error);
  }
);

export default api;
