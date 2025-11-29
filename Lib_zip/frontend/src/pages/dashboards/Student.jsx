// frontend/src/pages/dashboards/Student.jsx
import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../api/axios";
import "../../styles/dashboard.css";

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [fines, setFines] = useState([]);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      // 1) who am I
      const meRes = await API.get("/auth/me");
      const meUser = meRes.data.user || meRes.data;
      setUser(meUser);

      // 2) books catalogue
      const booksRes = await API.get("/books");

      // 3) borrow history (pass studentId explicitly because /history/:id doesn't rely on auth middleware)
      const borrowsRes = await API.get(`/borrows/history/${meUser.id || meUser._id}`);

      // 4) fines for this student
      const finesRes = await API.get("/fines", { params: { student: meUser.id || meUser._id } });

      setBooks(booksRes.data || []);
      setBorrows(borrowsRes.data || []);
      setFines(finesRes.data || []);
    } catch (err) {
      console.error("Student dashboard load error", err);
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    const activeLoans = borrows.filter(b => !b.returnedAt).length;
    const unpaid = fines.filter(f => !f.paid);
    const unpaidTotal = unpaid.reduce((sum, f) => sum + (f.amount || 0), 0);
    const nextDue = (() => {
      const active = borrows.filter(b => !b.returnedAt && b.dueAt);
      if (!active.length) return "—";
      const soonest = active.reduce((min, b) => (new Date(b.dueAt) < new Date(min.dueAt) ? b : min));
      return new Date(soonest.dueAt).toISOString().slice(0, 10);
    })();
    return {
      booksOnLoan: activeLoans,
      reserved: 0,
      unpaidFines: `₹${unpaidTotal}`,
      lastLogin: "—",
      nextDue,
      holdsPending: 0,
      accountStatus: user?.accountStatus || "active",
    };
  }, [borrows, fines, user]);

  async function requestBorrow(bookId) {
    if (!user) return;
    try {
      setError("");
      await API.post("/borrows/issue", { studentId: user.id || user._id, bookId });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not place borrow request");
    }
  }

  async function returnBook(borrowId) {
    try {
      setError("");
      await API.post(`/borrows/return/${borrowId}`);
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not return book");
    }
  }

  async function payFine(fineId) {
    try {
      setError("");
      // simple payment: mark as paid using payments endpoint
      await API.post("/payments", { fineId, provider: "cash", providerRef: `CASH-${Date.now()}` });
      await loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Payment failed");
    }
  }

  return (
    <Layout role="student">
      <div className="dashboard">
        <h1 className="page-title">User Dashboard</h1>

        {error && <div className="error" style={{ marginBottom: 12 }}>{error}</div>}

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
              <div className="kpi-number">{user?.name || ""}</div>
              <div className="kpi-label">{user?.email}</div>
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
                <div className="kpi-number">"Open 9:00–18:00"</div>
                <div className="kpi-label">Library Hours Today</div>
              </div>
            </div>
          </div>

          <div className="notice">
            <strong>Action Needed</strong>
            <div>Account Status: {stats.accountStatus}</div>
          </div>
        </section>

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>Borrow Books</h2>
          <p style={{ fontSize: 13, opacity: 0.85 }}>Click "Borrow" on a title with available copies.</p>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Available</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {books.map(b => (
                  <tr key={b._id}>
                    <td>{b.title}</td>
                    <td>{b.author}</td>
                    <td>{b.availableCopies}</td>
                    <td>
                      <button
                        className="link-btn"
                        disabled={loading || b.availableCopies <= 0}
                        onClick={() => requestBorrow(b._id)}
                      >
                        Borrow
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-panel" style={{ marginTop: 16 }}>
          <h2>My Loans</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Issued</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {borrows.map(b => (
                  <tr key={b._id}>
                    <td>{b.book?.title || ""}</td>
                    <td>{b.issuedAt ? new Date(b.issuedAt).toISOString().slice(0,10) : ""}</td>
                    <td>{b.dueAt ? new Date(b.dueAt).toISOString().slice(0,10) : ""}</td>
                    <td>{b.returnedAt ? "Returned" : "Active"}</td>
                    <td>
                      {!b.returnedAt && (
                        <button
                          className="link-btn"
                          disabled={loading}
                          onClick={() => returnBook(b._id)}
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-panel" style={{ marginTop: 16, marginBottom: 40 }}>
          <h2>Fines & Payments</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fines.map(f => (
                  <tr key={f._id}>
                    <td>₹{f.amount}</td>
                    <td>{f.reason || (f.borrow ? "Overdue" : "")}</td>
                    <td>{f.paid ? "Paid" : "Unpaid"}</td>
                    <td>{f.receiptId || "—"}</td>
                    <td>
                      {!f.paid && (
                        <button
                          className="link-btn"
                          disabled={loading}
                          onClick={() => payFine(f._id)}
                        >
                          Pay now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Layout>
  );
}
