import { useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import { useSocket } from "./hooks/useSocket.js";

export default function ChatRoom({ roomId }) {
  const { user, logout } = useAuth();
  const { messages, sendMessage } = useSocket(roomId);
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText("");
  }

  return (
    <main className="chat-shell">
      <header className="chat-header">
        <div>
          <p className="eyebrow">THREADBASE · THREAD {roomId}</p>
          <h1>Live chat</h1>
          <p className="subtle">Signed in as {user?.name}. Messages update live across connected windows.</p>
        </div>
        <button className="button button-quiet" onClick={logout}>Sign out</button>
      </header>
      <section className="messages-panel" aria-label="Chat messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">↗</div>
            <h2>Start the conversation</h2>
            <p>Send a message here, then open another window and sign in as the other demo user.</p>
          </div>
        ) : (
          <ul className="message-list">
            {messages.map((message) => (
              <li className={message.user === user?.name ? "message message-own" : "message"} key={message.id}>
                <div className="message-meta">
                  <strong>{message.user}</strong>
                  <time dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
                <p>{message.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <form className="message-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="message">Write a message</label>
        <input id="message" value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message…" maxLength={2000} autoComplete="off" />
        <button className="button" type="submit" disabled={!text.trim()}>Send message <span aria-hidden="true">↗</span></button>
      </form>
    </main>
  );
}
