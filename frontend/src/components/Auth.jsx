import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API}/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message);
      onAuth(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoBox}>S</span>
          <span style={styles.logoText}>Signex</span>
        </div>
        <p style={styles.sub}>
          {mode === "login"
            ? "OTP as a Service — sign in to your dashboard"
            : "Create your business account"}
        </p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>
          {mode === "login" ? "Welcome back" : "Get started"}
        </h2>

        <form onSubmit={submit}>
          {mode === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>BUSINESS NAME</label>
              <input
                style={styles.input}
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="Swiggy"
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>EMAIL</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="dev@swiggy.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        {mode === "register" && (
          <p style={styles.switchText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => setMode("login")}>
              Sign in
            </span>
          </p>
        )}
        {mode === "login" && (
          <p style={styles.switchText}>
            Don't have an account?{" "}
            <span style={styles.link} onClick={() => setMode("register")}>
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#111111",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
  },
  header: { textAlign: "center", marginBottom: 32 },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  logoBox: {
    background: "#333333",
    color: "#f0f0f0",
    fontWeight: 700,
    fontSize: 20,
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#f0f0f0", fontSize: 26, fontWeight: 700 },
  sub: { color: "#666666", marginTop: 8, fontSize: 14 },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "32px 36px",
    width: 380,
    maxWidth: "90vw",
  },
  title: { color: "#f0f0f0", fontSize: 22, fontWeight: 700, margin: "0 0 24px" },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#999999", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 6 },
  input: {
    width: "100%",
    background: "#222222",
    border: "1px solid #333333",
    borderRadius: 6,
    color: "#f0f0f0",
    fontSize: 14,
    padding: "10px 12px",
    boxSizing: "border-box",
    outline: "none",
  },
  btn: {
    width: "100%",
    background: "#f0f0f0",
    border: "none",
    borderRadius: 6,
    color: "#111111",
    fontSize: 15,
    fontWeight: 600,
    padding: "11px",
    cursor: "pointer",
    marginTop: 8,
  },
  error: { color: "#ff4444", fontSize: 13, margin: "8px 0 0" },
  switchText: { color: "#666666", fontSize: 13, textAlign: "center", marginTop: 20 },
  link: { color: "#cccccc", cursor: "pointer", fontWeight: 600 },
};
