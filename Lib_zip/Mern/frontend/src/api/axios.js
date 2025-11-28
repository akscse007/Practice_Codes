// frontend/src/api/axios.js
import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const API = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
