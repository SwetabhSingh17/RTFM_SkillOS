import { aiService } from "../services/aiService";

/**
 * Assessment Generator Agent
 * 
 * Responsibility: Reads uploaded learning materials (PDF, DOCX, text) and dynamically 
 * generates MCQs, quizzes, and assessments mapped to Bloom's Taxonomy.
 */
export class AssessmentGeneratorAgent {
  static async generateQuiz(content: string, questions: number, difficulty: string = "medium") {
    return await aiService.generateQuizFromContent(content, { questions, difficulty });
  }
}
