import { Router } from "express";
import { db } from "../db";
import { users, userCompetencies, competencyDomains, competencyItems, quizAttempts, quizzes, igotEnrollments, igotCourses, learningPaths } from "../../shared/schema";
import { eq, count, avg, sql } from "drizzle-orm";
import { requireRoles, ROLES } from "../middleware/rbac";

export const analyticsRouter = Router();

// GET /api/analytics/learner/:userId — Learner-specific stats
analyticsRouter.get("/learner/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Competency stats
    const competencies = await db.select().from(userCompetencies).where(eq(userCompetencies.userId, userId));
    const avgLevel = competencies.length > 0
      ? Math.round(competencies.reduce((sum, c) => sum + c.currentLevel, 0) / competencies.length)
      : 0;
    const avgGap = competencies.length > 0
      ? Math.round(competencies.reduce((sum, c) => sum + (c.targetLevel - c.currentLevel), 0) / competencies.length)
      : 0;

    // Quiz stats
    const attempts = await db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId));
    const completedAttempts = attempts.filter(a => a.status === "submitted");
    const avgScore = completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) / completedAttempts.length)
      : 0;

    // Enrollment stats
    const enrollments = await db.select().from(igotEnrollments).where(eq(igotEnrollments.userId, userId));
    const completedCourses = enrollments.filter(e => e.status === "completed").length;
    const inProgressCourses = enrollments.filter(e => e.status === "in_progress").length;

    // Learning paths
    const paths = await db.select().from(learningPaths).where(eq(learningPaths.userId, userId));
    const activePaths = paths.filter(p => p.status === "active").length;

    // Estimated learning hours (from completed quizzes and courses)
    const learningHours = completedCourses * 4 + completedAttempts.length * 0.5; // rough estimate

    res.json({
      competency: {
        totalItems: competencies.length,
        averageLevel: avgLevel,
        averageGapPercent: avgGap,
        highPriorityGaps: competencies.filter(c => c.priority === "high" || c.priority === "critical").length,
      },
      quizzes: {
        totalAttempts: attempts.length,
        completed: completedAttempts.length,
        averageScore: avgScore,
        bestScore: completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.percentageScore || 0)) : 0,
      },
      courses: {
        enrolled: enrollments.length,
        completed: completedCourses,
        inProgress: inProgressCourses,
      },
      learningPaths: {
        active: activePaths,
        total: paths.length,
      },
      learningHours: Math.round(learningHours * 10) / 10,
      badges: Math.min(completedCourses + completedAttempts.length, 20), // simple badge calc
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch learner analytics" });
  }
});

// GET /api/analytics/workforce — Org-wide competency heatmap data
analyticsRouter.get("/workforce", requireRoles([ROLES.ADMIN, ROLES.HR]), async (req, res) => {
  try {
    const domains = await db.select().from(competencyDomains);
    const items = await db.select().from(competencyItems);
    const allCompetencies = await db.select().from(userCompetencies);
    const allUsers = await db.select().from(users);

    // Group by domain
    const heatmapData = domains.map(d => {
      const domainItems = items.filter(i => i.domainId === d.id);
      const domainComps = allCompetencies.filter(c =>
        domainItems.some(i => i.id === c.competencyItemId)
      );

      const avgLevel = domainComps.length > 0
        ? Math.round(domainComps.reduce((s, c) => s + c.currentLevel, 0) / domainComps.length)
        : 0;

      return {
        domain: d.name,
        averageLevel: avgLevel,
        totalAssessments: domainComps.length,
        items: domainItems.map(item => {
          const itemComps = allCompetencies.filter(c => c.competencyItemId === item.id);
          return {
            name: item.name,
            averageLevel: itemComps.length > 0
              ? Math.round(itemComps.reduce((s, c) => s + c.currentLevel, 0) / itemComps.length)
              : 0,
            assessedUsers: itemComps.length,
          };
        }),
      };
    });

    // Org stats
    const totalLearners = allUsers.filter(u => u.role === "learner").length;
    const allEnrollments = await db.select().from(igotEnrollments);
    const allAttempts = await db.select().from(quizAttempts);

    res.json({
      heatmap: heatmapData,
      orgStats: {
        totalLearners,
        totalEnrollments: allEnrollments.length,
        completedCourses: allEnrollments.filter(e => e.status === "completed").length,
        totalQuizAttempts: allAttempts.length,
        averageQuizScore: allAttempts.filter(a => a.percentageScore).length > 0
          ? Math.round(allAttempts.filter(a => a.percentageScore).reduce((s, a) => s + (a.percentageScore || 0), 0) / allAttempts.filter(a => a.percentageScore).length)
          : 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch workforce analytics" });
  }
});

// GET /api/analytics/quiz-performance — Quiz performance metrics
analyticsRouter.get("/quiz-performance", async (req, res) => {
  try {
    const allQuizzes = await db.select().from(quizzes);
    const allAttempts = await db.select().from(quizAttempts);

    const quizMetrics = allQuizzes.map(quiz => {
      const attempts = allAttempts.filter(a => a.quizId === quiz.id);
      const completed = attempts.filter(a => a.status === "submitted");

      return {
        quizId: quiz.id,
        title: quiz.title,
        difficulty: quiz.difficulty,
        totalAttempts: attempts.length,
        completedAttempts: completed.length,
        averageScore: completed.length > 0
          ? Math.round(completed.reduce((s, a) => s + (a.percentageScore || 0), 0) / completed.length)
          : 0,
        passRate: completed.length > 0
          ? Math.round(completed.filter(a => (a.percentageScore || 0) >= 60).length / completed.length * 100)
          : 0,
      };
    });

    res.json({ quizMetrics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch quiz performance" });
  }
});
