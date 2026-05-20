import axios from "axios";

const api = axios.create({
  baseURL: "https://cafe-pos-system-fqo7.onrender.com/api",
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
    // Only log error if it's NOT a 401 from /auth/me
    if (!(error.config?.url?.includes('/auth/me') && error.response?.status === 401)) {
      console.error('API Error:', error.response?.data?.message || error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;