import { Router } from "express";
import { aiService } from "../services/aiService";
import { contentProcessor } from "../services/contentProcessor";
import { db } from "../db";
import { quizzes, quizQuestions, learningMaterials } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { requireRoles, ROLES } from "../middleware/rbac";

export const quizRouter = Router();

quizRouter.post("/generate", requireRoles([ROLES.ADMIN, ROLES.TRAINER, ROLES.HR]), async (req, res) => {
  const { materialId, difficulty, numberOfQuestions } = req.body;
  // Hardcoded for demo/MVP
  const userId = 1;

  try {
    // 1. Fetch material
    const material = await db.select().from(learningMaterials).where(eq(learningMaterials.id, materialId)).limit(1);
    if (!material.length) {
      return res.status(404).json({ error: "Material not found" });
    }

    // 2. Extract text (mocked)
    const text = material[0].extractedText || "Sample statistical metadata and SDG indicators document.";
    
    // 3. Generate quiz with local AI
    console.log(`Generating quiz with AI (LM Studio/Ollama) for material: ${materialId}`);
    const generatedQuestions = await aiService.generateQuizFromContent(text, {
      questions: numberOfQuestions || 5,
      difficulty: difficulty || "medium"
    });

    // 4. Save to DB
    const newQuiz = await db.insert(quizzes).values({
      materialId: material[0].id,
      title: `Generated Quiz: ${material[0].title}`,
      description: `AI-generated quiz covering ${difficulty} level concepts.`,
      createdById: userId,
      difficulty: difficulty || "medium",
      totalQuestions: generatedQuestions.length,
      status: "published",
      generatedByAI: true,
      aiModel: process.env.LLM_MODEL || "gemma-4-e4b"
    }).returning();

    const quizId = newQuiz[0].id;

    // Save questions
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      await db.insert(quizQuestions).values({
        quizId,
        sequence: i + 1,
        questionType: "mcq_single",
        questionText: q.questionText,
        options: q.options.map((opt: string, idx: number) => ({ id: `opt_${idx}`, text: opt })),
        correctAnswers: [q.correctAnswer],
        explanation: q.explanation,
        difficulty: difficulty || "medium",
        points: 1
      });
    }

    res.json({ success: true, quizId, message: "Quiz generated successfully", questions: generatedQuestions.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

quizRouter.get("/", async (req, res) => {
  try {
    const allQuizzes = await db.select().from(quizzes);
    res.json(allQuizzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

quizRouter.get("/:id", async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const quiz = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
    
    if (!quiz.length) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    
    const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
    
    res.json({ ...quiz[0], questions });
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});
