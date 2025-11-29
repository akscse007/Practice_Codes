// frontend/src/pages/dashboards/Accountant.jsx
import React from "react";
import Layout from "../../components/Layout";
import "../../styles/dashboard.css";

export default function AccountantDashboard() {
  return (
    <Layout role="accountant">
      <div className="dashboard">
        <h1 className="page-title">Accountant Dashboard</h1>

        <section className="glass-panel">
          <h2>Daily fine records</h2>
          <p>TODO: fetch from /api/fines/daily.</p>
        </section>

        <section className="glass-panel">
          <h2>Impose fine</h2>
          <p>TODO: form to create manual fine for a student.</p>
        </section>

        <section className="glass-panel">
          <h2>Receipts</h2>
          <p>TODO: show recent payments and receipts.</p>
        </section>
      </div>
    </Layout>
  );
}
