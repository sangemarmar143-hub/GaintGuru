require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildSystemPrompt } = require("./systemPrompt");
const {
  createChat,
  getChat,
  getAllChats,
  addMessage,
  getHistory,
  deleteChat,
} = require("./chatStore");
const {
  checkLimit,
  recordMessage,
  upgradeToPro,
  downgradeToFree,
  getStatus,
} = require("./subscriptionStore");

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST", "DELETE", "PATCH"],
  })
);
app.use(express.json());

// ── Gemini client ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// ── User ID helper (IP-based; swap for JWT userId in production) ───────────────
function getUserId(req) {
  return req.headers["x-user-id"] || req.ip || "anonymous";
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get("/health", (_, res) => res.json({ status: "ok" }));

// List all chats
app.get("/api/chats", (_, res) => res.json(getAllChats()));

// Create a new chat
app.post("/api/chats", (req, res) => {
  const { classLevel = 10 } = req.body;
  const chat = createChat(classLevel);
  res.status(201).json(chat);
});

// Get a single chat (with messages)
app.get("/api/chats/:id", (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat) return res.status(404).json({ error: "Chat not found" });
  res.json(chat);
});

// Delete a chat
app.delete("/api/chats/:id", (req, res) => {
  const deleted = deleteChat(req.params.id);
  res.json({ deleted });
});

// ── Subscription routes ───────────────────────────────────────────────────────

/**
 * GET /api/subscription
 * Returns current plan + usage for this user
 */
app.get("/api/subscription", (req, res) => {
  const userId = getUserId(req);
  res.json(getStatus(userId));
});

/**
 * PATCH /api/subscription/upgrade
 * Simulates upgrading to Pro (in production: verify payment then call this)
 * Body: { secret?: string }  — optional server secret for protection
 */
app.patch("/api/subscription/upgrade", (req, res) => {
  const userId = getUserId(req);
  const user = upgradeToPro(userId);
  res.json({ success: true, plan: user.plan });
});

/**
 * PATCH /api/subscription/downgrade  (dev/testing only)
 */
app.patch("/api/subscription/downgrade", (req, res) => {
  const userId = getUserId(req);
  const user = downgradeToFree(userId);
  res.json({ success: true, plan: user.plan });
});

/**
 * POST /api/chat/:id/stream
 * Body: { message, classLevel?, language? }
 * Header: x-user-id (optional; falls back to IP)
 *
 * Returns 429 if free-plan limit exceeded.
 * Streams SSE tokens otherwise.
 */
app.post("/api/chat/:id/stream", async (req, res) => {
  const { id } = req.params;
  const { message, classLevel = 10, language = "auto" } = req.body;
  const userId = getUserId(req);

  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  // ── Rate limit check ────────────────────────────────────────────────────────
  const limit = checkLimit(userId);
  if (!limit.allowed) {
    return res.status(429).json({
      error: "daily_limit_reached",
      message: `Free plan allows ${limit.limit} messages per day. Upgrade to Pro for unlimited access.`,
      usedToday: limit.usedToday,
      limit: limit.limit,
      plan: limit.plan,
    });
  }

  let chat = getChat(id);
  if (!chat) {
    chat = createChat(classLevel);
  }

  addMessage(chat.id, "user", message);

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // Send current usage so frontend can update counter
  send({
    usage: {
      plan: limit.plan,
      usedToday: limit.usedToday + 1, // +1 for this message
      limit: limit.limit,
      remaining: limit.remaining !== null ? limit.remaining - 1 : null,
    },
  });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: buildSystemPrompt(classLevel, language),
    });

    const geminiChat = model.startChat({
      history: getHistory(chat.id).slice(0, -1),
    });

    const result = await geminiChat.sendMessageStream(message);

    let fullText = "";
    for await (const chunk of result.stream) {
      const token = chunk.text();
      fullText += token;
      send({ token });
    }

    addMessage(chat.id, "model", fullText);
    recordMessage(userId); // increment counter only on success

    const topicMatch = fullText.match(/^TOPIC:\s*(.+)$/m);
    const topic = topicMatch ? topicMatch[1].trim() : null;

    send({ done: true, topic, chatId: chat.id });
    res.end();
  } catch (err) {
    console.error("Gemini error:", err);
    send({ error: err.message || "Model error" });
    res.end();
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`GanitGuru backend running on http://localhost:${PORT}`);
});
