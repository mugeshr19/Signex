import { useState, useEffect } from "react";

const BASE     = import.meta.env.VITE_API_URL;
const OTP_BASE = import.meta.env.VITE_OTP_URL;

/* ── palette ── */
const C = {
  bg:      "#111111",
  card:    "#1a1a1a",
  input:   "#222222",
  border:  "#2a2a2a",
  border2: "#333333",
  muted:   "#666666",
  subtle:  "#999999",
  light:   "#cccccc",
  heading: "#f0f0f0",
};

/* ── tiny helpers ── */
const row   = (extra = {}) => ({ display: "flex", alignItems: "center", ...extra });
const col   = (extra = {}) => ({ display: "flex", flexDirection: "column", ...extra });

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, ...col({ gap: 8, zIndex: 9999 }) }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: "12px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500,
          minWidth: 240, animation: "slideUp .25s ease",
          background:    t.type === "success" ? "#1a2e1a" : "#2e1a1a",
          border: `1px solid ${t.type === "success" ? "#2d5a2d" : "#5a2d2d"}`,
          color:         t.type === "success" ? "#6fcf6f" : "#cf6f6f",
        }}>
          {t.type === "success" ? "✓ " : "✕ "}{t.message}
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════
   STAT CARD
════════════════════════════════════════════ */
function StatCard({ label, value, sub, loading }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "22px 24px", flex: 1 }}>
      <div style={{ color: C.subtle, fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>{label}</div>
      {loading
        ? <div style={{ height: 36, width: 60, background: C.border2, borderRadius: 6, animation: "pulse 1.4s infinite" }} />
        : <div style={{ color: C.heading, fontSize: 30, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      }
      <div style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>{sub}</div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════ */
export default function Dashboard({ business, setBusiness, onLogout, onDocs }) {
  const [tab,          setTab]          = useState("overview");
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [copied,       setCopied]       = useState(false);
  const [rotating,     setRotating]     = useState(false);
  const [webhookUrl,   setWebhookUrl]   = useState(business.webhook || "");
  const [webhookSaved, setWebhookSaved] = useState(!!business.webhook);
  const [savingHook,   setSavingHook]   = useState(false);
  const [loggingOut,   setLoggingOut]   = useState(false);
  const [toasts,       setToasts]       = useState([]);

  /* ── fetch stats ── */
  useEffect(() => {
    fetch(`${OTP_BASE}/stats`, {
      headers: { "x-api-key": business.apiKey },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, [business.apiKey]);

  const todayCount  = stats?.todayCount  ?? 0;
  const emailCount  = stats?.emailCount  ?? 0;
  const smsCount    = stats?.smsCount    ?? 0;
  const dailyLimit  = stats?.dailyLimit  ?? 1000;
  const usagePct    = dailyLimit ? Math.round((todayCount / dailyLimit) * 100) : 0;

  /* ── toast helper ── */
  const toast = (message, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  /* ── logout ── */
  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch(`${BASE}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    onLogout();
  };

  /* ── copy key ── */
  const handleCopy = () => {
    navigator.clipboard.writeText(business.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("API key copied to clipboard");
  };

  /* ── rotate key ── */
  const handleRotate = async () => {
    if (!confirm("Are you sure? Your old API key will stop working immediately.")) return;
    setRotating(true);
    try {
      const res  = await fetch(`${BASE}/rotate-api-key`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) return toast(data.message || "Failed to rotate key", "error");
      setBusiness({ ...business, apiKey: data.newApiKey });
      toast(`New key: ${data.newApiKey.slice(0, 16)}…`);
    } catch {
      toast("Network error", "error");
    } finally {
      setRotating(false);
    }
  };

  /* ── save webhook ── */
  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) return toast("Enter a webhook URL", "error");
    setSavingHook(true);
    try {
      const res  = await fetch(`${BASE}/webhook`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook: webhookUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return toast(data.message || "Failed to save webhook", "error");
      setBusiness({ ...business, webhook: webhookUrl.trim() });
      setWebhookSaved(true);
      toast("Webhook saved successfully");
    } catch {
      toast("Network error", "error");
    } finally {
      setSavingHook(false);
    }
  };

  const memberSince = new Date(business.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "system-ui, sans-serif", color: C.light }}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100% { opacity:.4 } 50% { opacity:.8 } }
        input::placeholder { color: ${C.muted}; }
        button:disabled    { opacity:.5; cursor:not-allowed; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "0 32px", height: 58,
        ...row({ justifyContent: "space-between" }),
      }}>
        <div style={row({ gap: 10 })}>
          <div style={{
            background: C.border2, color: C.heading, fontWeight: 800,
            fontSize: 15, width: 32, height: 32, borderRadius: 8,
            ...row({ justifyContent: "center" }),
          }}>S</div>
          <span style={{ color: C.heading, fontWeight: 700, fontSize: 17 }}>Signex</span>
          <span style={{
            background: C.input, border: `1px solid ${C.border2}`,
            color: C.subtle, fontSize: 10, fontWeight: 700,
            padding: "2px 8px", borderRadius: 4, letterSpacing: 1,
          }}>DASHBOARD</span>
        </div>
        <div style={row({ gap: 10 })}>
          <span style={{ color: C.subtle, fontSize: 13 }}>{business.name}</span>
          <button onClick={onDocs}         style={s.navBtn}>Docs</button>
          <button onClick={handleLogout} disabled={loggingOut}
            style={{ ...s.navBtn, color: "#cf6f6f", borderColor: "#3a1a1a" }}>
            {loggingOut ? "…" : "Logout"}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ color: C.heading, fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>
            Good morning, {business.name} 👋
          </h1>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>
            Manage your OTP service, API keys and webhooks.
          </p>
        </div>

        {/* ── STATS ROW ── */}
        <div style={row({ gap: 16, marginBottom: 20 })}>
          <StatCard label="OTPs TODAY"  value={todayCount} sub={`of ${dailyLimit.toLocaleString()} daily limit`} loading={statsLoading} />
          <StatCard label="VIA EMAIL"   value={emailCount} sub="sent today"  loading={statsLoading} />
          <StatCard label="VIA SMS"     value={smsCount}   sub="sent today"  loading={statsLoading} />
        </div>

        {/* ── USAGE BAR ── */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 24px", marginBottom: 32 }}>
          <div style={row({ justifyContent: "space-between", marginBottom: 12 })}>
            <div>
              <div style={{ color: C.heading, fontWeight: 600, fontSize: 14 }}>Daily OTP Usage</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Resets every midnight</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.heading, fontWeight: 700 }}>{usagePct}%</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{todayCount} / {dailyLimit.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ background: C.input, borderRadius: 4, height: 7, overflow: "hidden" }}>
            <div style={{
              width: `${usagePct}%`, height: "100%", borderRadius: 4,
              background: usagePct > 80 ? "#cf6f6f" : C.light,
              transition: "width .5s ease",
            }} />
          </div>
          {usagePct > 80 && (
            <div style={{ color: "#cf6f6f", fontSize: 13, marginTop: 10 }}>
              ⚠ You are approaching your daily limit.
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={row({ gap: 4, marginBottom: 24 })}>
          {[["overview","Overview"],["apikey","API Key"],["webhook","Webhook"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              background: tab === key ? C.input : "transparent",
              border: `1px solid ${tab === key ? C.border2 : "transparent"}`,
              color: tab === key ? C.heading : C.muted,
              fontSize: 13, fontWeight: 600, padding: "8px 18px",
              borderRadius: 6, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {/* ══════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════ */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* account info */}
            <div style={s.card}>
              <div style={s.cardTitle}>Account Info</div>
              {[["Business", business.name], ["Email", business.email], ["Member Since", memberSince]].map(([k, v]) => (
                <div key={k} style={{ ...row({ justifyContent: "space-between" }), padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{k}</span>
                  <span style={{ color: C.light, fontSize: 13 }}>{v}</span>
                </div>
              ))}
              <div style={row({ gap: 8, marginTop: 16, flexWrap: "wrap" })}>
                <Tag>Email OTP</Tag>
                <Tag>SMS OTP</Tag>
                {business.webhook && <Tag green>Webhook</Tag>}
              </div>
            </div>
            {/* quick actions */}
            <div style={s.card}>
              <div style={s.cardTitle}>Quick Actions</div>
              <div style={col({ gap: 10 })}>
                <button onClick={() => setTab("apikey")}  style={s.actionBtn}>🔑  Manage API Key</button>
                <button onClick={() => setTab("webhook")} style={s.actionBtn}>🔗  Configure Webhook</button>
                <button onClick={onDocs}                  style={s.actionBtn}>📄  View API Docs</button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            TAB: API KEY
        ══════════════════════════════ */}
        {tab === "apikey" && (
          <div style={s.card}>
            <div style={row({ justifyContent: "space-between", marginBottom: 20 })}>
              <div style={s.cardTitle}>API Key</div>
              <Tag green>Active</Tag>
            </div>

            {/* key display */}
            <div style={{ color: C.subtle, fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>YOUR API KEY</div>
            <div style={row({ gap: 10, marginBottom: 24 })}>
              <div style={{ ...s.code, flex: 1, fontSize: 13, letterSpacing: .5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {business.apiKey}
              </div>
              <button onClick={handleCopy} style={{ ...s.actionBtn, whiteSpace: "nowrap", padding: "0 18px", height: 42 }}>
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            {/* snippet */}
            <div style={{ color: C.subtle, fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>USAGE EXAMPLE</div>
            <pre style={{ ...s.code, fontSize: 13, lineHeight: 1.75, marginBottom: 28, overflowX: "auto" }}>{`// npm install signex
const Signex = require("signex");
const client = new Signex(process.env.SIGNEX_API_KEY);

await client.sendOtp("user@email.com");
await client.verifyOtp("user@email.com", "482910");`}</pre>

            {/* rotate */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 22 }}>
              <div style={{ color: C.heading, fontWeight: 600, marginBottom: 6 }}>Rotate API Key</div>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>
                If compromised, generate a new one instantly. Old key stops working immediately.
              </div>
              <button onClick={handleRotate} disabled={rotating} style={s.dangerBtn}>
                {rotating ? "Rotating…" : "⟳  Rotate Key"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════
            TAB: WEBHOOK
        ══════════════════════════════ */}
        {tab === "webhook" && (
          <div style={s.card}>
            <div style={{ marginBottom: 20 }}>
              <div style={s.cardTitle}>Webhook Configuration</div>
              <div style={{ color: C.muted, fontSize: 13 }}>
                Signex will POST to your URL every time an OTP is verified.
              </div>
            </div>

            {/* payload preview */}
            <div style={{ color: C.subtle, fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>PAYLOAD PREVIEW</div>
            <pre style={{ ...s.code, fontSize: 13, lineHeight: 1.75, marginBottom: 24, overflowX: "auto" }}>{`POST https://your-app.com/signex-webhook

{
  "event":      "otp.verified",
  "target":     "customer@gmail.com",
  "channel":    "email",
  "businessId": "${business.id || business._id}",
  "verifiedAt": "2026-01-01T10:00:00.000Z"
}`}</pre>

            {/* url input */}
            <div style={{ color: C.subtle, fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>WEBHOOK URL</div>
            <input
              value={webhookUrl}
              onChange={e => { setWebhookUrl(e.target.value); setWebhookSaved(false); }}
              placeholder="https://your-app.com/signex-webhook"
              style={{ ...s.inputField, marginBottom: 14 }}
            />
            <button onClick={handleSaveWebhook} disabled={savingHook} style={s.primaryBtn}>
              {savingHook ? "Saving…" : "Save Webhook"}
            </button>

            {webhookSaved && webhookUrl && (
              <div style={{ marginTop: 14, ...row({ gap: 8 }) }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6fcf6f", display: "inline-block" }} />
                <span style={{ color: "#6fcf6f", fontSize: 13 }}>Webhook active at {webhookUrl}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Toast toasts={toasts} />
    </div>
  );
}

/* ── Tag ── */
function Tag({ children, green }) {
  return (
    <span style={{
      background: green ? "#1a2e1a" : C.input,
      border: `1px solid ${green ? "#2d5a2d" : C.border2}`,
      color: green ? "#6fcf6f" : C.subtle,
      fontSize: 11, fontWeight: 600, padding: "3px 10px",
      borderRadius: 20, letterSpacing: .5,
    }}>{children}</span>
  );
}

/* ── shared styles ── */
const s = {
  navBtn: {
    background: "none", border: `1px solid ${C.border2}`,
    color: C.light, fontSize: 13, padding: "6px 14px",
    borderRadius: 6, cursor: "pointer",
  },
  card: {
    background: C.card, border: `1px solid ${C.border}`,
    borderRadius: 10, padding: 24,
  },
  cardTitle: { color: C.heading, fontWeight: 700, fontSize: 15, marginBottom: 16 },
  actionBtn: {
    background: C.input, border: `1px solid ${C.border2}`,
    color: C.light, fontSize: 13, padding: "10px 16px",
    borderRadius: 6, cursor: "pointer", textAlign: "left",
  },
  primaryBtn: {
    background: C.heading, border: "none", color: C.bg,
    fontSize: 14, fontWeight: 600, padding: "10px 24px",
    borderRadius: 6, cursor: "pointer",
  },
  dangerBtn: {
    background: "#2a1a1a", border: "1px solid #4a2a2a",
    color: "#cf6f6f", fontSize: 13, fontWeight: 600,
    padding: "10px 20px", borderRadius: 6, cursor: "pointer",
  },
  code: {
    background: C.input, border: `1px solid ${C.border2}`,
    borderRadius: 6, color: C.light, padding: "12px 16px",
    fontFamily: "ui-monospace, Consolas, monospace", margin: 0,
  },
  inputField: {
    width: "100%", background: C.input, border: `1px solid ${C.border2}`,
    borderRadius: 6, color: C.heading, fontSize: 14,
    padding: "10px 12px", boxSizing: "border-box",
    outline: "none", fontFamily: "system-ui, sans-serif",
  },
};
