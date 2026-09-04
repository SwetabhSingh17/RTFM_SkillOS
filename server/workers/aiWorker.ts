import { Worker, Job } from "bullmq";
import { connection } from "../services/queueService";
import { aiService } from "../services/aiService";
import { emitToUser } from "../services/websocket";

// This worker processes AI-related background tasks like parsing big documents and generating quizzes
export const aiWorker = new Worker(
  "ai-tasks",
  async (job: Job) => {
    console.log(`[AI Worker] Processing job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case "generate-quiz": {
        const { materialId, text, options, userId } = job.data;
        // Call the LLM to generate the quiz
        console.log(`[AI Worker] Generating quiz for material ${materialId}...`);
        const questions = await aiService.generateQuizFromContent(text, options);
        
        // Notify the user in real-time
        if (userId) {
          emitToUser(userId, "quiz-ready", { materialId, questionsCount: questions.length });
        }
        
        return { success: true, count: questions.length };
      }
      
      case "parse-document": {
        const { fileUrl } = job.data;
        // Dummy implementation for now
        console.log(`[AI Worker] Parsing document \${fileUrl}...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); 
        return { success: true, extractedText: "Dummy text" };
      }
      
      default:
        throw new Error(`Unknown job name: \${job.name}`);
    }
  },
  { connection }
);

aiWorker.on("completed", (job) => {
  console.log(`[AI Worker] Job \${job.id} completed!`);
});

aiWorker.on("failed", (job, err) => {
  console.error(`[AI Worker] Job \${job?.id} failed:`, err.message);
});
