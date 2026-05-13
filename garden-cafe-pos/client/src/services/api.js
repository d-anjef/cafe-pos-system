import axios from "axios";

const api = axios.create({
  baseURL: "https://cafe-pos-system-fqo7.onrender.com/api",
});

export default api;