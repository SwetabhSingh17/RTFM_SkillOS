import { aiService } from "../services/aiService";

/**
 * Tutor / Virtual Assistant Agent
 * 
 * Responsibility: Acts as an interactive support system for learners. It can provide 
 * explanations for incorrect quiz answers and act as a conversational assistant.
 */
export class TutorAgent {
  static async explainAnswer(question: string, userAnswer: string, correctAnswer: string) {
    return await aiService.generateExplanation(question, userAnswer, correctAnswer);
  }

  static async handleChat(messages: { role: string; content: string }[]) {
    return await aiService.chat(messages);
  }

  static async handleChatStream(messages: { role: string; content: string }[]) {
    return await aiService.chatStream(messages);
  }
}
