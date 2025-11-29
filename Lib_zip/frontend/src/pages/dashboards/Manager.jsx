// frontend/src/pages/dashboards/Manager.jsx
import React from "react";
import Layout from "../../components/Layout";
import "../../styles/dashboard.css";

export default function ManagerDashboard() {
  return (
    <Layout role="manager">
      <div className="dashboard">
        <h1 className="page-title">Manager Dashboard</h1>

        <section className="glass-panel">
          <h2>Pending Lend Requests</h2>
          <p>TODO: wire to /api/borrows/requests</p>
        </section>

        <section className="glass-panel">
          <h2>Students</h2>
          <p>TODO: list students with account status and borrows.</p>
        </section>

        <section className="glass-panel">
          <h2>Fines overview</h2>
          <p>TODO: daily and unpaid fines summary.</p>
        </section>
      </div>
    </Layout>
  );
}
