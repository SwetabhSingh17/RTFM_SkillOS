import { aiService } from "../services/aiService";

/**
 * Competency Profiler Agent
 * 
 * Responsibility: Evaluates a user's profile against predefined competency frameworks 
 * (Statistical, Technical, Digital Governance, Behavioural) to identify skill gaps.
 */
export class CompetencyProfilerAgent {
  static async analyzeProfile(profileText: string, framework: any) {
    // Delegates to the existing AI service, but allows for future 
    // agentic expansion (e.g., retrieving previous training records, etc.)
    return await aiService.generateCompetencyProfile(profileText, framework);
  }
}
