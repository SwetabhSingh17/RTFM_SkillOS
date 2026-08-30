import { Router } from "express";
import { OrchestratorAgent, TutorAgent } from "../agents";

export const chatRouter = Router();

function extractText(value: any): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractText).join("");
  if (!value || typeof value !== "object") return "";
  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;
  if (typeof value.delta === "string") return value.delta;
  return "";
}

function extractDeltaContentAndReasoning(delta: any) {
  let content = typeof delta?.content === "string" ? delta.content : "";
  let reasoning = "";

  const directReasoning =
    delta?.reasoning ??
    delta?.reasoning_content ??
    delta?.thinking ??
    delta?.reasoningText ??
    delta?.reasoningContent;
  reasoning += extractText(directReasoning);

  if (Array.isArray(delta?.content)) {
    for (const part of delta.content) {
      const type = String(part?.type || "").toLowerCase();
      const text = extractText(part?.text ?? part?.content ?? part?.delta ?? part);
      if (!text) continue;

      if (type.includes("reason") || type.includes("think")) {
        reasoning += text;
      } else {
        content += text;
      }
    }
  }

  return { content, reasoning };
}

// POST /api/chat — AI Assistant chat
chatRouter.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await OrchestratorAgent.handleChat(messages);
    res.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// POST /api/chat/stream — AI Assistant chat stream (SSE)
chatRouter.post("/stream", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in proxies
    res.flushHeaders(); // Establish the connection immediately

    const stream = await OrchestratorAgent.handleChatStream(messages);
    
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      const { content, reasoning } = extractDeltaContentAndReasoning(delta);

      if (reasoning) {
        res.write(`data: ${JSON.stringify({ type: "reasoning", content: reasoning })}\n\n`);
      }
      if (content) {
        res.write(`data: ${JSON.stringify({ type: "content", content })}\n\n`);
      }
    }
    
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Chat Stream error:", error);
    res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to connect to AI Model" })}\n\n`);
    res.end();
  }
});

// POST /api/chat/explain — Get AI explanation for a quiz question
chatRouter.post("/explain", async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;
    const explanation = await TutorAgent.explainAnswer(question, userAnswer, correctAnswer);
    res.json({ explanation });
  } catch (error) {
    console.error("Explain error:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});
