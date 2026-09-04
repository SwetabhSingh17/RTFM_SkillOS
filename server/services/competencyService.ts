import { db } from "../db";
import { competencyItems, userCompetencies, competencyDomains } from "../../shared/schema";
import { eq, and } from "drizzle-orm";

// ---------------------------------------------------------
// COLD START WEIGHT VECTORS & MAPPINGS
// ---------------------------------------------------------

// 1. Designation Modifiers
// Higher designations imply higher targets and slightly higher baselines across the board.
const designationWeights: Record<string, { baseBonus: number; targetBonus: number }> = {
  "Joint Director": { baseBonus: 30, targetBonus: 90 },
  "Deputy Director": { baseBonus: 25, targetBonus: 80 },
  "Assistant Director": { baseBonus: 20, targetBonus: 70 },
  "Senior Statistical Officer": { baseBonus: 25, targetBonus: 75 },
  "Junior Statistical Officer": { baseBonus: 10, targetBonus: 60 },
  "Statistical Investigator": { baseBonus: 5, targetBonus: 50 },
  "default": { baseBonus: 0, targetBonus: 50 },
};

// 2. Education Keywords mapping to Domains
// E.g. "MSc in Statistics" boosts the "Statistical" domain heavily.
const educationDomainBoosts: Record<string, { domainId: number; boost: number }[]> = {
  "statistic": [{ domainId: 1, boost: 30 }, { domainId: 2, boost: 10 }], // Assuming Domain 1 is Statistical, 2 is Technical
  "data science": [{ domainId: 1, boost: 20 }, { domainId: 2, boost: 30 }],
  "computer": [{ domainId: 2, boost: 35 }, { domainId: 3, boost: 20 }], // Technical & Digital Governance
  "management": [{ domainId: 4, boost: 30 }], // Behavioural / Leadership
  "public admin": [{ domainId: 4, boost: 25 }, { domainId: 3, boost: 20 }],
};

export const competencyService = {
  /**
   * The core algorithm to infer a user's starting point (Cold Start).
   * @param userId The ID of the user
   * @param profile The user's onboarding metadata
   */
  async runColdStart(userId: number, profile: any) {
    try {
      console.log(`[Cold Start Engine] Running for user \${userId}...`);
      
      // Fetch all available competency items and domains
      const items = await db.select().from(competencyItems).where(eq(competencyItems.isActive, true));
      const domains = await db.select().from(competencyDomains);
      
      // We need to map domain names to their IDs dynamically just in case
      const domainMap: Record<string, number> = {};
      domains.forEach(d => domainMap[d.name.toLowerCase()] = d.id);
      
      // 1. Determine Designation Multipliers
      let desigKey = Object.keys(designationWeights).find(k => 
        profile.designation.toLowerCase().includes(k.toLowerCase())
      );
      const dWeights = designationWeights[desigKey || "default"];

      // 2. Experience Multiplier (Capped at 20 years, 1.5 points per year)
      const expYears = Math.min(profile.workExperienceYears || 0, 20);
      const expBonus = Math.floor(expYears * 1.5);

      // 3. Education Parsing
      let eduBoosts: Record<number, number> = {}; // domainId -> boost amount
      if (profile.educationalQualifications) {
        const edu = profile.educationalQualifications.toLowerCase();
        for (const [keyword, boosts] of Object.entries(educationDomainBoosts)) {
          if (edu.includes(keyword)) {
            boosts.forEach(b => {
              // Ensure we use the correct domain ID based on DB, defaulting to 1/2/3/4 if not found
              const mappedDomainId = b.domainId; 
              eduBoosts[mappedDomainId] = (eduBoosts[mappedDomainId] || 0) + b.boost;
            });
          }
        }
      }

      const results = [];

      for (const item of items) {
        // Calculate Base Level (Current Level)
        // Formula: Base = DesignationBonus + ExperienceBonus + EducationBonus(for this domain)
        let baseLevel = dWeights.baseBonus + expBonus + (eduBoosts[item.domainId] || 0);
        
        // Add a bit of randomization to simulate natural variation (+/- 5 points)
        baseLevel += Math.floor(Math.random() * 10) - 5;
        
        // Clamp between 10 and 90
        baseLevel = Math.max(10, Math.min(90, baseLevel));

        // Calculate Target Level
        // Target is primarily driven by designation, with a minimum offset above base.
        let targetLevel = dWeights.targetBonus;
        // If they are highly educated, they might already exceed the target, so bump target slightly
        if (baseLevel >= targetLevel) {
          targetLevel = Math.min(100, baseLevel + 10);
        }

        // Clamp between 40 and 100
        targetLevel = Math.max(40, Math.min(100, targetLevel));

        // Determine Priority (Severity of the gap)
        const gap = targetLevel - baseLevel;
        let priority = "low";
        if (gap > 40) priority = "critical";
        else if (gap > 25) priority = "high";
        else if (gap > 10) priority = "medium";

        // Upsert into DB
        const existing = await db.select().from(userCompetencies)
          .where(and(
            eq(userCompetencies.userId, userId),
            eq(userCompetencies.competencyItemId, item.id)
          ))
          .limit(1);

        if (existing.length > 0) {
          // If it exists, maybe we don't overwrite it fully, or we do if it's a fresh cold start.
          // For now, we update it.
          await db.update(userCompetencies).set({
            currentLevel: baseLevel,
            targetLevel: targetLevel,
            priority,
            aiNotes: "Inferred via Cold Start Algorithm",
            updatedAt: new Date()
          }).where(eq(userCompetencies.id, existing[0].id));
          
          results.push({ itemId: item.id, currentLevel: baseLevel, targetLevel, priority });
        } else {
          await db.insert(userCompetencies).values({
            userId,
            competencyItemId: item.id,
            currentLevel: baseLevel,
            targetLevel,
            priority,
            aiNotes: "Inferred via Cold Start Algorithm"
          });
          
          results.push({ itemId: item.id, currentLevel: baseLevel, targetLevel, priority });
        }
      }

      console.log(`[Cold Start Engine] Completed gap inference for user \${userId} across \${items.length} competencies.`);
      return { success: true, assessedItems: results.length };

    } catch (error) {
      console.error("[Cold Start Engine] Error:", error);
      throw error;
    }
  }
};
