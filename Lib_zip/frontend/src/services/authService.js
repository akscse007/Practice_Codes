// frontend/src/services/authService.js
import API, { TOKEN_KEY } from "../api/axios";

export const saveToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

// Register: server may set cookie and/or return token in body
export const register = async (payload) => {
  const res = await API.post("/auth/register", payload);
  // If backend returns token explicitly, persist it
  if (res?.data?.token) saveToken(res.data.token);
  return res;
};

// Login: server may set cookie and/or return token in body
export const login = async (payload) => {
  const res = await API.post("/auth/login", payload);
  if (res?.data?.token) saveToken(res.data.token);
  return res;
};

export const logout = async () => {
  try {
    await API.post("/auth/logout");
  } catch (e) {
    // ignore network errors on logout
  } finally {
    removeToken();
  }
};

// call /auth/me to verify login; works with cookie OR Authorization header
export const me = async () => {
  return API.get("/auth/me");
};
