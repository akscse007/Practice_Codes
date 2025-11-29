// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/dashboards/Student";
import LibrarianDashboard from "./pages/dashboards/Librarian";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";
import Register from "./pages/auth/Register";

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/dashboard/student" element={
        <PrivateRoute>
          <RoleRoute allowed={["student"]}>
            <StudentDashboard/>
          </RoleRoute>
        </PrivateRoute>
      } />
      <Route path="/dashboard/librarian" element={
        <PrivateRoute>
          <RoleRoute allowed={["librarian","manager"]}>
            <LibrarianDashboard/>
          </RoleRoute>
        </PrivateRoute>
      } />
      {/* add other dashboards similarly */}
    </Routes>
  );
}
