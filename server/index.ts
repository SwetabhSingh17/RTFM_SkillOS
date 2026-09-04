import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { createServer } from "http";
import { initSocket } from "./services/websocket";
import { igotClient } from "./services/igotClient";

// Route imports
import { quizRouter } from "./routes/quiz";
import { competenciesRouter } from "./routes/competencies";
import { learningPathsRouter } from "./routes/learningPaths";
import { igotRouter } from "./routes/igot";
import { materialsRouter } from "./routes/materials";
import { analyticsRouter } from "./routes/analytics";
import { chatRouter } from "./routes/chat";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";

export const app = express();
export const httpServer = createServer(app);
initSocket(httpServer);

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "rtfm_skillos-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Serve uploaded files
const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

// Serve React Frontend in Production
if (process.env.NODE_ENV === "production") {
  const CLIENT_DIST = path.join(__dirname, "../../client/dist");
  app.use(express.static(CLIENT_DIST));
  // We'll handle the SPA fallback at the very end of the routes
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    ai_model: process.env.LLM_MODEL || "local-model",
    ai_endpoint: process.env.OPENAI_BASE_URL || "http://localhost:1234/v1",
    storage: process.env.UPLOAD_STORAGE_TYPE || "local",
  });
});

// Register routes
app.use("/api/auth", authRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/competencies", competenciesRouter);
app.use("/api/learning-paths", learningPathsRouter);
app.use("/api/igot", igotRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/chat", chatRouter);
app.use("/api/users", usersRouter);

// Temporary test route to trigger iGOT mock sync
app.post("/api/igot/sync", async (req, res) => {
  try {
    const result = await igotClient.syncCatalog();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize RTOS Queues and Workers
import "./services/queueService";
import "./workers/aiWorker";
import "./workers/rtosWorker";

// SPA Fallback for React (must be after all API routes)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
    }
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 RTFM_SkillOS Server running on port ${PORT}`);
  console.log(`📡 AI Endpoint: ${process.env.OPENAI_BASE_URL || "http://localhost:1234/v1"}`);
  console.log(`🤖 AI Model: ${process.env.LLM_MODEL || "local-model"}`);
  console.log(`📁 Upload Storage: ${process.env.UPLOAD_STORAGE_TYPE || "local"}\n`);
});
