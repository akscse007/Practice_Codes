// frontend/src/pages/dashboards/Student.jsx
import React from "react";
import Layout from "../../components/Layout";
import "../../styles/dashboard.css";

export default function StudentDashboard() {
  // Placeholder values — replace with API calls
  const stats = {
    booksOnLoan: 2,
    reserved: 0,
    unpaidFines: "₹120",
    lastLogin: "27 Nov 2025, 11:22 pm",
    nextDue: "2025-11-18",
    holdsPending: 0,
  };

  return (
    <Layout role="student">
      <div className="dashboard">
        <h1 className="page-title">User Dashboard</h1>

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">📚</div>
            <div>
              <div className="kpi-number">{stats.booksOnLoan}</div>
              <div className="kpi-label">Books on Loan</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">⏳</div>
            <div>
              <div className="kpi-number">{stats.reserved}</div>
              <div className="kpi-label">Reserved (Pending)</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">💰</div>
            <div>
              <div className="kpi-number">{stats.unpaidFines}</div>
              <div className="kpi-label">Unpaid Fines</div>
            </div>
          </div>

          <div className="kpi">
            <div className="kpi-icon">👤</div>
            <div>
              <div className="kpi-number">{stats.lastLogin}</div>
              <div className="kpi-label">Last Login</div>
            </div>
          </div>
        </div>

        <section className="glass-panel">
          <h2>At a glance</h2>
          <div className="kpi-row small">
            <div className="kpi small">
              <div className="kpi-icon">📅</div>
              <div>
                <div className="kpi-number">{stats.nextDue}</div>
                <div className="kpi-label">Next Due Date</div>
              </div>
            </div>

            <div className="kpi small">
              <div className="kpi-icon">📎</div>
              <div>
                <div className="kpi-number">{stats.holdsPending}</div>
                <div className="kpi-label">Holds Pending</div>
              </div>
            </div>

            <div className="kpi small">
              <div className="kpi-icon">🏛️</div>
              <div>
                <div className="kpi-number">Open 9:00–18:00</div>
                <div className="kpi-label">Library Hours Today</div>
              </div>
            </div>
          </div>

          <div className="notice">
            <strong>Action Needed</strong>
            <div>Account Status</div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
