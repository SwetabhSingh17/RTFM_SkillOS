import { aiService } from "./aiService";
import { db } from "../db";
import { igotCourses } from "../../shared/schema";

export const recommendationEngine = {
  async recommend(userId: number, gaps: any[]) {
    // Fetch available courses (simulating matching logic)
    const courses = await db.select().from(igotCourses);
    
    // For MVP, just return all available courses or pass to AI to filter
    return courses;
  }
};
