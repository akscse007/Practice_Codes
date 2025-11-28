// frontend/src/pages/Login.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import "../styles/login.css";

/**
 * Hardened Login page with robust Google Identity handling.
 *
 * Usage notes:
 * - public/index.html must include:
 *     <script src="https://accounts.google.com/gsi/client" async defer></script>
 * - .env should contain VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
 * - Restart Vite after changing .env
 */

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const googleContainerRef = useRef(null);

  // Read client id from Vite env
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  const redirectByRole = useCallback((user) => {
    const role = user?.role || "student";
    if (role === "student") navigate("/dashboard/student");
    else if (role === "librarian") navigate("/dashboard/librarian");
    else navigate("/");
  }, [navigate]);

  // Handle credentials from Google (id_token)
  async function handleGoogleResponse(response) {
    console.debug("[GSI] handleGoogleResponse called:", response && typeof response === "object" ? { hasCredential: !!response.credential } : response);
    if (!response?.credential) {
      setError("Google sign-in failed: no credential returned.");
      return;
    }
    setError("");
    try {
      setLoading(true);
      const res = await API.post("/auth/google", { id_token: response.credential });
      if (res?.data?.success) {
        const { token, user } = res.data;
        if (token) localStorage.setItem("lms_token", token);
        redirectByRole(user);
      } else {
        setError(res?.data?.message || "Google login failed.");
      }
    } catch (err) {
      console.error("[GSI] backend /auth/google error:", err);
      setError(err?.response?.data?.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  // Robust initializer: wait for SDK and for DOM node to exist, then renderButton
  useEffect(() => {
    console.debug("[GSI] useEffect start. CLIENT_ID:", GOOGLE_CLIENT_ID || "(missing)");
    if (!GOOGLE_CLIENT_ID) {
      console.warn("[GSI] Missing VITE_GOOGLE_CLIENT_ID — check .env and restart dev server.");
      return;
    }

    let mounted = true;
    let tries = 0;
    const maxTries = 80;
    const pollInterval = 200;

    async function waitForSDK() {
      // Poll for window.google.accounts.id presence
      while (mounted && (!window.google || !window.google.accounts || !window.google.accounts.id) && tries < maxTries) {
        tries++;
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, pollInterval));
      }
      if (!mounted) return false;
      if (!window.google || !window.google.accounts || !window.google.accounts.id) {
        console.warn("[GSI] SDK not available after polling. It may be blocked by an extension or CSP.");
        return false;
      }
      return true;
    }

    async function init() {
      const ok = await waitForSDK();
      if (!ok) return;

      try {
        console.debug("[GSI] initializing google.accounts.id ...");
        // Always (re)initialize to avoid stale state from previous runs. The SDK is lightweight.
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          ux_mode: "popup",
          auto_select: false,
        });
        console.debug("[GSI] initialize OK.");
      } catch (e) {
        console.error("[GSI] initialize threw:", e);
        return;
      }

      // ensure the DOM target exists; wait a few frames if needed
      const target = googleContainerRef.current || document.getElementById("google-signin-official");
      if (!target) {
        console.warn("[GSI] render target not found; ensure the component includes the #google-signin-official element.");
        return;
      }

      // Give React a chance to paint children; then renderButton
      requestAnimationFrame(() => {
        try {
          // Clear before render to avoid duplicate content
          target.innerHTML = "";
          if (window.google?.accounts?.id?.renderButton) {
            window.google.accounts.id.renderButton(target, {
              type: "standard",
              theme: "outline",
              size: "large",
              width: 220,
            });
            console.debug("[GSI] renderButton invoked on target:", target);
          } else {
            console.warn("[GSI] renderButton not exposed on google.accounts.id (unexpected).");
          }
        } catch (err) {
          console.error("[GSI] renderButton error:", err);
        }
      });
    }

    init();

    return () => { mounted = false; };
  }, [GOOGLE_CLIENT_ID]); // re-run if client id changes

  // Click on visible round icon — robustly trigger prompt or fallback to clicking official button
  function onClickGoogle() {
    setError("");
    console.debug("[GSI] onClickGoogle invoked; google present?", !!window.google, "accounts.id present?", !!window.google?.accounts?.id);

    // Preferred: prompt which will open popup/one-tap depending on server config.
    if (window.google?.accounts?.id?.prompt) {
      try {
        // prompt requires user gesture in many browsers; calling from click is correct.
        window.google.accounts.id.prompt((notification) => {
          console.debug("[GSI] prompt notification:", notification);
          // If prompt returns isNotDisplayed_reason that requires a click, fallback will try below.
        });
        return;
      } catch (err) {
        console.warn("[GSI] prompt threw:", err);
      }
    }

    // Fallback: try to find the official button rendered into our hidden container and programmatically click it
    try {
      const official = googleContainerRef.current || document.getElementById("google-signin-official");
      console.debug("[GSI] trying to find official button inside:", official);
      if (official) {
        const btn = official.querySelector("button");
        if (btn) {
          console.debug("[GSI] clicking official rendered button fallback.");
          btn.click();
          return;
        } else {
          console.debug("[GSI] no button element found in official container; container innerHTML starts with:", official.innerHTML?.slice?.(0,160));
        }
      }
    } catch (e) {
      console.warn("[GSI] fallback click error:", e);
    }

    // final fallback
    console.warn("[GSI] Google SDK not ready or blocked by extension. Check Console for earlier warnings.");
    setError("Google sign-in not available (check adblockers or console).");
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email: form.email.trim(), password: form.password });
      if (res?.data?.success) {
        const { token, user } = res.data;
        if (token) localStorage.setItem("lms_token", token);
        redirectByRole(user);
      } else {
        setError(res?.data?.message || "Login failed.");
      }
    } catch (err) {
      console.error("[AUTH] /auth/login error:", err);
      setError(err?.response?.data?.message || "Server unreachable");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page fixed-bg" style={{ backgroundImage: `url('/cover.png')` }}>
      <div className="bg-overlay" aria-hidden />
      <main className="login-wrap">
        <section className="brand">
          <h1 className="brand-title">DigiLiB</h1>
          <p className="brand-sub">welcome to the digital library @ calcuuta uniiversity</p>
        </section>

        <form className="glass-card" onSubmit={submit} autoComplete="on" noValidate>
          <h2 className="form-title">Sign in</h2>

          <label className="input-label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            className="input-control"
            value={form.email}
            onChange={handleChange}
            placeholder="you@college.edu"
            autoComplete="email"
            type="email"
          />

          <label className="input-label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            className="input-control"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="password"
            autoComplete="current-password"
          />

          {error && <div className="error" role="alert">{error}</div>}

          <button className="btn primary glass-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="bottom-row">
            <Link to="/register" className="link-btn">Create account</Link>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* official button is rendered into this small/invisible container for SDK to attach (must not be display:none) */}
              <div
                id="google-signin-official"
                ref={googleContainerRef}
                style={{ width: 1, height: 1, opacity: 0, position: "absolute", pointerEvents: "none", overflow: "hidden" }}
              />

              {/* round glass Google icon button (visible) */}
              <button
                type="button"
                onClick={onClickGoogle}
                className="google-circle"
                title="Sign in with Google"
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 533.5 544.3" width="18" height="18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path fill="#4285F4" d="M533.5 278.4c0-17.9-1.6-35.1-4.6-51.7H272v98h146.9c-6.4 34.7-25.4 64.1-54.2 83.8v69.9h87.5c51.2-47.2 80.3-116.7 80.3-199.9z"/>
                  <path fill="#34A853" d="M272 544.3c73.7 0 135.6-24.4 180.8-66.3l-87.5-69.9c-24.4 16.4-55.6 26-93.3 26-71.6 0-132.3-48.3-154-113.1H27.8v71.3C72 470 165 544.3 272 544.3z"/>
                  <path fill="#FBBC05" d="M118 322.9c-10.9-32.7-10.9-67.9 0-100.6V151h-90.2C9.8 206.2 0 239.6 0 273s9.8 66.8 27.8 122l90.2-72.1z"/>
                  <path fill="#EA4335" d="M272 106.1c39.9 0 75.8 13.7 104 40.7l78-78C407.6 24.9 344.8 0 272 0 165 0 72 74.3 27.8 173l90.2 72.1C139.7 154.4 200.4 106.1 272 106.1z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
