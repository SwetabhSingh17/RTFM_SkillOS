import { TutorAgent } from "./TutorAgent";
import { AssessmentGeneratorAgent } from "./AssessmentGeneratorAgent";
import { CompetencyProfilerAgent } from "./CompetencyProfilerAgent";
import { LearningPathArchitectAgent } from "./LearningPathArchitectAgent";

/**
 * Orchestrator Agent
 * 
 * Responsibility: Acts as a zero-latency router (using regex/keywords) to automatically 
 * direct natural language user requests from the chat interface to the correct specialized agent.
 */
export class OrchestratorAgent {
  static async handleChat(messages: { role: string; content: string }[]) {
    const lastMessage = [...messages].reverse().find(m => m.role === "user")?.content.toLowerCase() || "";

    // 1. Quiz Generation Routing
    if (/(generate|create|make).*quiz/i.test(lastMessage)) {
      // In a full app, we might extract the specific text from context, but here we just pass the prompt
      const questions = await AssessmentGeneratorAgent.generateQuiz(lastMessage, 3, "medium");
      return `I have generated a quiz based on your request:\n\n\`\`\`json\n${JSON.stringify(questions, null, 2)}\n\`\`\``;
    }

    // 2. Profile Analysis Routing
    if (/(analyze.*profile|competenc(y|ies)|skill gap)/i.test(lastMessage)) {
      const dummyFramework = { domains: ["Technical", "Statistical", "Digital Governance"] };
      const profile = await CompetencyProfilerAgent.analyzeProfile(lastMessage, dummyFramework);
      return `I analyzed your profile against the MoSPI framework. Here are your skill gaps:\n\n\`\`\`json\n${JSON.stringify(profile.gaps, null, 2)}\n\`\`\``;
    }

    // 3. Learning Path Routing
    if (/(learning path|recommend.*course)/i.test(lastMessage)) {
      const dummyGaps = [{ competencyName: "Python", targetLevel: 80 }];
      const path = await LearningPathArchitectAgent.generatePath(dummyGaps, { format: "online" });
      return `Here is a personalized learning pathway for you:\n\n\`\`\`json\n${JSON.stringify(path.steps, null, 2)}\n\`\`\``;
    }

    // Default Fallback: Conversational Tutor Agent
    return await TutorAgent.handleChat(messages);
  }

  static async handleChatStream(messages: { role: string; content: string }[]) {
    const lastMessage = [...messages].reverse().find(m => m.role === "user")?.content.toLowerCase() || "";

    // If the request hits one of our specialized keywords, handle it statically and yield as a single chunk
    if (/(generate.*quiz|analyze.*profile|learning path|competenc(y|ies)|skill gap|recommend.*course)/i.test(lastMessage)) {
      const staticResponse = await this.handleChat(messages);
      
      // Wrap the static response into an AsyncGenerator to match the OpenAI streaming interface
      return (async function* () {
        yield { choices: [{ delta: { content: staticResponse } }] };
      })();
    }

    // Otherwise, stream the standard Tutor chat response
    return await TutorAgent.handleChatStream(messages);
  }
}
