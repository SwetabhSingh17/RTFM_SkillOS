import { Router } from "express";
import { db } from "../db";
import { igotCourses, igotEnrollments } from "../../shared/schema";
import { eq, and, like } from "drizzle-orm";

export const igotRouter = Router();

// GET /api/igot/courses — Search/list iGOT courses
igotRouter.get("/courses", async (req, res) => {
  try {
    const { search, difficulty, language } = req.query;
    let courses = await db.select().from(igotCourses).where(eq(igotCourses.isActive, true));

    // Client-side filtering for MVP (would be SQL WHERE in production)
    if (search) {
      const q = (search as string).toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
      );
    }
    if (difficulty) {
      courses = courses.filter(c => c.difficulty === difficulty);
    }
    if (language) {
      courses = courses.filter(c => c.language === language);
    }

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// GET /api/igot/courses/:id — Course details
igotRouter.get("/courses/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const course = await db.select().from(igotCourses).where(eq(igotCourses.id, id)).limit(1);
    if (!course.length) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
});

// POST /api/igot/enroll — Enroll user in course
igotRouter.post("/enroll", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Check if already enrolled
    const existing = await db.select().from(igotEnrollments)
      .where(and(
        eq(igotEnrollments.userId, userId),
        eq(igotEnrollments.courseId, courseId)
      ))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Already enrolled in this course" });
    }

    const enrollment = await db.insert(igotEnrollments).values({
      userId,
      courseId,
      status: "not_started",
      progressPercent: 0,
    }).returning();

    res.json({ success: true, enrollment: enrollment[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to enroll" });
  }
});

// GET /api/igot/enrollments/:userId — User's enrollments
igotRouter.get("/enrollments/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const enrollments = await db.select().from(igotEnrollments).where(eq(igotEnrollments.userId, userId));

    // Join with course info
    const enriched = await Promise.all(
      enrollments.map(async (e) => {
        const course = await db.select().from(igotCourses).where(eq(igotCourses.id, e.courseId)).limit(1);
        return { ...e, course: course[0] || null };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});
