import { Router } from "express";
import { db } from "../db";
import { competencyDomains, competencyItems, userCompetencies, userProfiles } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export const competenciesRouter = Router();

// GET /api/competencies/frameworks — All domains & items
competenciesRouter.get("/frameworks", async (req, res) => {
  try {
    const domains = await db.select().from(competencyDomains);
    const items = await db.select().from(competencyItems);

    const frameworks = domains.map(d => ({
      ...d,
      items: items.filter(item => item.domainId === d.id),
    }));

    res.json(frameworks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch frameworks" });
  }
});

// GET /api/competencies/profile/:userId — User's competency profile
competenciesRouter.get("/profile/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    const competencies = await db.select().from(userCompetencies).where(eq(userCompetencies.userId, userId));

    res.json({
      profile: profile[0] || null,
      competencies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// POST /api/competencies/assess — Submit self-assessment
competenciesRouter.post("/assess", async (req, res) => {
  try {
    const { userId, assessments } = req.body;
    // assessments: [{ competencyItemId, currentLevel, targetLevel, priority }]

    const results = [];
    for (const assessment of assessments) {
      // Check if competency entry exists
      const existing = await db.select().from(userCompetencies)
        .where(and(
          eq(userCompetencies.userId, userId),
          eq(userCompetencies.competencyItemId, assessment.competencyItemId)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update
        await db.update(userCompetencies)
          .set({
            currentLevel: assessment.currentLevel,
            targetLevel: assessment.targetLevel || 80,
            priority: assessment.priority || "medium",
            lastAssessedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userCompetencies.id, existing[0].id));
        results.push({ ...existing[0], ...assessment, updated: true });
      } else {
        // Insert
        const inserted = await db.insert(userCompetencies).values({
          userId,
          competencyItemId: assessment.competencyItemId,
          currentLevel: assessment.currentLevel,
          targetLevel: assessment.targetLevel || 80,
          priority: assessment.priority || "medium",
          lastAssessedAt: new Date(),
        }).returning();
        results.push({ ...inserted[0], created: true });
      }
    }

    res.json({ success: true, assessments: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save assessment" });
  }
});

// GET /api/competencies/gaps/:userId — Gap analysis
competenciesRouter.get("/gaps/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const competencies = await db.select().from(userCompetencies).where(eq(userCompetencies.userId, userId));
    const items = await db.select().from(competencyItems);
    const domains = await db.select().from(competencyDomains);

    const gaps = competencies.map(comp => {
      const item = items.find(i => i.id === comp.competencyItemId);
      const domain = item ? domains.find(d => d.id === item.domainId) : null;
      const gapSize = comp.targetLevel - comp.currentLevel;

      return {
        competencyId: comp.competencyItemId,
        competencyName: item?.name || "Unknown",
        domain: domain?.name || "Unknown",
        currentLevel: comp.currentLevel,
        targetLevel: comp.targetLevel,
        gapSize,
        gapPercent: Math.round((gapSize / comp.targetLevel) * 100),
        priority: comp.priority,
        severity: gapSize > 60 ? "critical" : gapSize > 40 ? "high" : gapSize > 20 ? "medium" : "low",
      };
    }).sort((a, b) => b.gapSize - a.gapSize);

    // Domain-level summary
    const domainSummary = domains.map(d => {
      const domainGaps = gaps.filter(g => g.domain === d.name);
      const avgGap = domainGaps.length > 0
        ? Math.round(domainGaps.reduce((sum, g) => sum + g.gapPercent, 0) / domainGaps.length)
        : 0;
      const avgCurrent = domainGaps.length > 0
        ? Math.round(domainGaps.reduce((sum, g) => sum + g.currentLevel, 0) / domainGaps.length)
        : 0;

      return {
        domain: d.name,
        averageGapPercent: avgGap,
        averageCurrentLevel: avgCurrent,
        itemCount: domainGaps.length,
        criticalItems: domainGaps.filter(g => g.severity === "critical").length,
      };
    });

    res.json({ gaps, domainSummary, totalGaps: gaps.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to calculate gaps" });
  }
});

// POST /api/competencies/profile — Create or update user profile
competenciesRouter.post("/profile", async (req, res) => {
  try {
    const { userId, designation, department, jobRole, currentAssignment, educationalQualifications, workExperienceYears, previousTrainings, careerLevel } = req.body;

    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);

    if (existing.length > 0) {
      await db.update(userProfiles).set({
        designation, department, jobRole, currentAssignment,
        educationalQualifications, workExperienceYears, previousTrainings, careerLevel,
        updatedAt: new Date(),
      }).where(eq(userProfiles.userId, userId));
      res.json({ success: true, message: "Profile updated" });
    } else {
      const inserted = await db.insert(userProfiles).values({
        userId, designation, department, jobRole, currentAssignment,
        educationalQualifications, workExperienceYears, previousTrainings, careerLevel,
      }).returning();
      res.json({ success: true, profile: inserted[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save profile" });
  }
});
