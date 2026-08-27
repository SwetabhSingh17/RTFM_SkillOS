import { Router } from "express";
import { aiService } from "../services/aiService";

export const chatRouter = Router();

// POST /api/chat — AI Assistant chat
chatRouter.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const response = await aiService.chat(messages);
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

    const stream = await aiService.chatStream(messages);
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Chat Stream error:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to connect to AI Model" })}\n\n`);
    res.end();
  }
});

// POST /api/chat/explain — Get AI explanation for a quiz question
chatRouter.post("/explain", async (req, res) => {
  try {
    const { question, userAnswer, correctAnswer } = req.body;
    const explanation = await aiService.generateExplanation(question, userAnswer, correctAnswer);
    res.json({ explanation });
  } catch (error) {
    console.error("Explain error:", error);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});
