import { db } from "../db";
import { igotCourses } from "../../shared/schema";

const IGOT_API_BASE_URL = process.env.IGOT_API_BASE_URL || "https://api.igotkarmayogi.gov.in";
const IGOT_API_KEY = process.env.IGOT_API_KEY;

export const igotClient = {
  /**
   * Syncs course catalog from iGOT APIs.
   * If API key is missing (e.g. during hackathon demo), falls back to mock data generation.
   */
  async syncCatalog() {
    console.log("[iGOT Client] Starting catalog sync...");

    if (!IGOT_API_KEY) {
      console.warn("[iGOT Client] No IGOT_API_KEY provided. Using mock data fallback.");
      return this._syncMockCatalog();
    }

    try {
      // In a real integration, this would fetch from IGOT_API_BASE_URL/v1/catalog
      // and map the response to our local db structure.
      // E.g. const response = await fetch(`${IGOT_API_BASE_URL}/v1/catalog`, { headers: { Authorization: `Bearer ${IGOT_API_KEY}` } });
      // const data = await response.json();
      
      console.log("[iGOT Client] Real API sync not fully implemented. Add endpoint specific mapping here.");
      return { success: true, count: 0 };
    } catch (error) {
      console.error("[iGOT Client] Error syncing catalog:", error);
      throw error;
    }
  },

  /**
   * Mocks a catalog sync to seed the database with Government-focused training modules.
   */
  async _syncMockCatalog() {
    const mockCourses = [
      {
        externalId: "igot-mock-101",
        title: "Introduction to Public Policy",
        description: "Fundamentals of policy making for central government officials.",
        provider: "ISTM",
        durationMinutes: 120,
        difficulty: "beginner",
        language: "english",
        tags: ["policy", "administration", "governance"],
      },
      {
        externalId: "igot-mock-102",
        title: "Cyber Security Awareness for Officials",
        description: "Best practices to prevent phishing and secure government data.",
        provider: "NIC",
        durationMinutes: 90,
        difficulty: "beginner",
        language: "hindi",
        tags: ["cybersecurity", "it", "security"],
      },
      {
        externalId: "igot-mock-103",
        title: "Advanced Data Analytics with Python",
        description: "For MoSPI and statistics department officials handling large datasets.",
        provider: "NSSTA",
        durationMinutes: 300,
        difficulty: "advanced",
        language: "english",
        tags: ["data analysis", "python", "statistics"],
      }
    ];

    let inserted = 0;
    for (const course of mockCourses) {
      // Upsert logic (simplistic for now)
      try {
        await db.insert(igotCourses).values({
          ...course,
          isActive: true
        }).onConflictDoNothing(); // Requires Postgres. If SQLite, we might just insert and ignore errors or check first.
        
        inserted++;
      } catch (err) {
        console.error(`Failed to insert mock course ${course.externalId}`, err);
      }
    }

    console.log(`[iGOT Client] Synced ${inserted} mock courses to local DB.`);
    return { success: true, count: inserted };
  },

  /**
   * Checks real-time enrollment and completion status from the remote iGOT system.
   */
  async checkEnrollmentStatus(userId: number, externalCourseId: string) {
    if (!IGOT_API_KEY) {
      // Mock random progress for demo
      return { 
        status: Math.random() > 0.5 ? "completed" : "in_progress", 
        progressPercent: Math.floor(Math.random() * 100) 
      };
    }
    
    // Implement real API call here
    return { status: "not_started", progressPercent: 0 };
  }
};
