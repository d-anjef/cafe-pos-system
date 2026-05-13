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

export default api;