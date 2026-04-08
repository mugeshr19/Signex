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
    background: "#132b35",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
  },
  header: { textAlign: "center", marginBottom: 32 },
  logo: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 },
  logoBox: {
    background: "linear-gradient(135deg, #1ec99a, #0a7c5c)",
    color: "#dff2ec",
    fontWeight: 700,
    fontSize: 20,
    width: 40,
    height: 40,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { color: "#dff2ec", fontSize: 26, fontWeight: 700 },
  sub: { color: "#8ee8c8", marginTop: 8, fontSize: 14 },
  card: {
    background: "rgba(10, 124, 92, 0.08)",
    border: "1px solid rgba(30, 201, 154, 0.25)",
    borderRadius: 12,
    padding: "32px 36px",
    width: 380,
    maxWidth: "90vw",
  },
  title: { color: "#dff2ec", fontSize: 22, fontWeight: 700, margin: "0 0 24px" },
  field: { marginBottom: 16 },
  label: { display: "block", color: "#1ec99a", fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 6 },
  input: {
    width: "100%",
    background: "rgba(19, 43, 53, 0.8)",
    border: "1px solid rgba(30, 201, 154, 0.2)",
    borderRadius: 6,
    color: "#dff2ec",
    fontSize: 14,
    padding: "10px 12px",
    boxSizing: "border-box",
    outline: "none",
  },
  btn: {
    width: "100%",
    background: "#0a7c5c",
    border: "1px solid #1ec99a",
    borderRadius: 6,
    color: "#dff2ec",
    fontSize: 15,
    fontWeight: 600,
    padding: "11px",
    cursor: "pointer",
    marginTop: 8,
  },
  error: { color: "#ff6b6b", fontSize: 13, margin: "8px 0 0" },
  switchText: { color: "#8ee8c8", fontSize: 13, textAlign: "center", marginTop: 20 },
  link: { color: "#1ec99a", cursor: "pointer", fontWeight: 600 },
};
