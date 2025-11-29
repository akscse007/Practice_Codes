// frontend/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { TOKEN_KEY } from "../api/axios";

/**
 * Simple PrivateRoute that checks for access token in localStorage.
 * You can replace the check with a store/state check (e.g. useAuth).
 */
export default function PrivateRoute({ redirectTo = "/login" }) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }
  return <Outlet />;
}
