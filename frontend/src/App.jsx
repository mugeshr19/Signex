import { useState } from "react";
import Auth from "./components/Auth.jsx";

function App() {
  const [business, setBusiness] = useState(null);

  if (!business) return <Auth onAuth={(data) => setBusiness(data.business || data)} />;

  return (
    <div style={{ color: "#fff", background: "#0d1117", minHeight: "100vh", padding: 40 }}>
      <h2>Welcome, {business.name}</h2>
      <p>Email: {business.email}</p>
      <p>API Key: <code>{business.apiKey}</code></p>
    </div>
  );
}

export default App;
