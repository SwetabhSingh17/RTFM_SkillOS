import { Router } from "express";
import { db } from "../db";
import { learningPaths, learningPathSteps, igotCourses } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { aiService } from "../services/aiService";

export const learningPathsRouter = Router();

// GET /api/learning-paths/:userId — User's learning paths
learningPathsRouter.get("/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const paths = await db.select().from(learningPaths).where(eq(learningPaths.userId, userId));

    const pathsWithSteps = await Promise.all(
      paths.map(async (path) => {
        const steps = await db.select().from(learningPathSteps)
          .where(eq(learningPathSteps.pathId, path.id));
        return { ...path, steps: steps.sort((a, b) => a.sequence - b.sequence) };
      })
    );

    res.json(pathsWithSteps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch learning paths" });
  }
});

// POST /api/learning-paths/generate — AI-generate new path
learningPathsRouter.post("/generate", async (req, res) => {
  try {
    const { userId, gaps, preferences } = req.body;

    // Use AI to generate learning path
    const aiPath = await aiService.generateLearningPath(gaps, preferences);

    // Save to DB
    const newPath = await db.insert(learningPaths).values({
      userId,
      title: aiPath.title || "AI-Generated Learning Path",
      description: aiPath.description || "Personalized path based on your competency gaps",
      estimatedDuration: aiPath.estimatedWeeks ? `${aiPath.estimatedWeeks} weeks` : "8 weeks",
      targetCompetencies: gaps?.map((g: any) => g.competencyId) || [],
      aiGenerated: true,
      status: "active",
    }).returning();

    const pathId = newPath[0].id;

    // Save steps
    const steps = aiPath.steps || [];
    for (let i = 0; i < steps.length; i++) {
      await db.insert(learningPathSteps).values({
        pathId,
        sequence: i + 1,
        stepType: steps[i].stepType || "course",
        title: steps[i].title,
        description: steps[i].description,
        estimatedHours: steps[i].estimatedHours || 4,
        status: "pending",
      });
    }

    // Return complete path
    const savedSteps = await db.select().from(learningPathSteps).where(eq(learningPathSteps.pathId, pathId));
    res.json({ success: true, path: { ...newPath[0], steps: savedSteps } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate learning path" });
  }
});

// PUT /api/learning-paths/:pathId/steps/:stepId — Update step status
learningPathsRouter.put("/:pathId/steps/:stepId", async (req, res) => {
  try {
    const stepId = parseInt(req.params.stepId);
    const { status } = req.body;

    await db.update(learningPathSteps).set({
      status,
      completedAt: status === "completed" ? new Date() : undefined,
    }).where(eq(learningPathSteps.id, stepId));

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update step" });
  }
});
