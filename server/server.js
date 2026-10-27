import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import { randomUUID } from "crypto";

const app = express();
const httpServer = createServer(app);
const PORT = Number(process.env.PORT) || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret-change-me";
const CLIENT_ORIGIN = "http://localhost:5173";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());

const users = [
  { id: 1, name: "Ada", email: "ada@threadbase.dev", password: "password" },
  { id: 2, name: "Linus", email: "linus@threadbase.dev", password: "password" },
];

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const user = users.find((candidate) => candidate.email === email && candidate.password === password);
  if (!user) {
    return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect" } });
  }

  const payload = { id: user.id, name: user.name, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "2h" });
  return res.json({ token, user: payload });
});

function verifyToken(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization ?? "");
  if (!match) {
    return res.status(401).json({ error: { code: "AUTH_REQUIRED", message: "Authentication required" } });
  }
  try {
    req.user = jwt.verify(match[1], JWT_SECRET, { algorithms: ["HS256"] });
    return next();
  } catch {
    return res.status(401).json({ error: { code: "AUTH_REQUIRED", message: "Authentication required" } });
  }
}

app.get("/api/me", verifyToken, (req, res) => res.json({ user: req.user }));

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));

  try {
    socket.data.user = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    return next();
  } catch {
    return next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.on("room:join", (roomId) => {
    if (typeof roomId !== "string" || !roomId.trim()) return;
    socket.join(roomId);
  });

  socket.on("chat:message", ({ roomId, text } = {}) => {
    if (typeof roomId !== "string" || !roomId.trim()) return;
    if (typeof text !== "string" || !text.trim()) return;

    const message = {
      id: randomUUID(),
      text: text.trim().slice(0, 2000),
      user: socket.data.user.name,
      timestamp: new Date().toISOString(),
    };

    // io.to includes the sender, so the author sees their own message too.
    io.to(roomId).emit("chat:message", message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Threadbase server listening on http://localhost:${PORT}`);
});
