import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthContext.jsx";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export function useSocket(roomId) {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !roomId) {
      socketRef.current = null;
      setMessages([]);
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });
    socketRef.current = socket;
    setMessages([]);

    const onMessage = (message) => {
      setMessages((current) => [...current, message]);
    };

    socket.on("connect", () => {
      socket.emit("room:join", roomId);
    });
    socket.on("chat:message", onMessage);

    return () => {
      socket.off("chat:message", onMessage);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [token, roomId]);

  const sendMessage = useCallback((text) => {
    const trimmed = typeof text === "string" ? text.trim() : "";
    if (!trimmed || !socketRef.current?.connected) return;
    socketRef.current.emit("chat:message", { roomId, text: trimmed });
  }, [roomId]);

  return { messages, sendMessage };
}
