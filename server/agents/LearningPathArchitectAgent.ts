import { aiService } from "../services/aiService";

/**
 * Learning Path Architect Agent
 * 
 * Responsibility: Recommends personalized learning pathways by matching a user's 
 * identified skill gaps against iGOT Karmayogi courses and NSSTA TPAC trainings.
 */
export class LearningPathArchitectAgent {
  static async generatePath(gaps: any, preferences: any) {
    return await aiService.generateLearningPath(gaps, preferences);
  }

  static async findRelevantCourses(query: string, availableCourses: any[]) {
    return await aiService.semanticSearchCourses(query, availableCourses);
  }
}
