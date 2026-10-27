import { useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import ChatRoom from "./ChatRoom.jsx";

export default function App() {
  const { token, login } = useAuth();
  const [email, setEmail] = useState("ada@threadbase.dev");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  if (token) return <ChatRoom roomId="thread-42" />;

  return (
    <main className="login-layout">
      <section className="login-card">
        <div className="brand-mark">T</div>
        <p className="eyebrow">THREADBASE WORKSPACE</p>
        <h1>Chat in real time.</h1>
        <p className="subtle">Sign in to join the thread conversation. Open a second window to test live messages with another account.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          {error && <p className="error-message" role="alert">{error}</p>}
          <button className="button button-wide" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <div className="demo-accounts">
          <p className="eyebrow">DEMO ACCOUNTS</p>
          <button type="button" onClick={() => { setEmail("ada@threadbase.dev"); setPassword("password"); }}>Ada Lovelace <span>ada@threadbase.dev</span></button>
          <button type="button" onClick={() => { setEmail("linus@threadbase.dev"); setPassword("password"); }}>Linus Torvalds <span>linus@threadbase.dev</span></button>
          <small>Password for both: <code>password</code></small>
        </div>
      </section>
      <aside className="login-aside">
        <div className="live-pill"><span /> REAL-TIME · SOCKET.IO</div>
        <h2>One thread.<br />Every message,<br /><em>in sync.</em></h2>
        <p>Authenticated sockets keep each conversation scoped to its own room, so the right people see the right messages.</p>
        <div className="aside-stat"><strong>01</strong><span>JWT-authenticated connection</span></div>
        <div className="aside-stat"><strong>02</strong><span>Room-scoped broadcasts</span></div>
        <div className="aside-stat"><strong>03</strong><span>Bidirectional live messaging</span></div>
      </aside>
    </main>
  );
}
