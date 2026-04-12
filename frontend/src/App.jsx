import { useState, useEffect } from "react";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";

const API = import.meta.env.VITE_API_URL;

export default function App() {
  const [business, setBusiness] = useState(null);
  const [checked,  setChecked]  = useState(false);

  useEffect(() => {
    fetch(`${API}/me`, { credentials: "include" })
      .then(r => {
        if (r.status === 401) return null;
        return r.ok ? r.json() : null;
      })
      .then(data => { if (data?.business) setBusiness(data.business); })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return (
    <div style={{ background: "#111111", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontFamily: "system-ui, sans-serif" }}>
      Loading…
    </div>
  );

  if (!business) return (
    <Auth onAuth={data => setBusiness(data.business || data)} />
  );

  return (
    <Dashboard
      business={business}
      setBusiness={setBusiness}
      onLogout={() => setBusiness(null)}
      onDocs={() => window.open("https://github.com/your-org/signex", "_blank")}
    />
  );
}
