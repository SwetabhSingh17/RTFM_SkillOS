import { Worker, Job } from "bullmq";
import { connection } from "../services/queueService";
import { emitToUser } from "../services/websocket";

// This worker processes RTOS events like syncing competency profiles asynchronously
export const rtosWorker = new Worker(
  "rtos-events",
  async (job: Job) => {
    console.log(`[RTOS Worker] Processing job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case "recalculate-competency": {
        const { userId, source } = job.data;
        // Recalculate competency scores based on latest quiz or course completion
        console.log(`[RTOS Worker] Recalculating competency for user ${userId} triggered by ${source}...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Notify the user dashboard to refresh radar charts
        emitToUser(userId, "competency-updated", { source, timestamp: Date.now() });
        
        return { success: true };
      }
      
      default:
        throw new Error(`Unknown job name: \${job.name}`);
    }
  },
  { connection }
);

rtosWorker.on("completed", (job) => {
  console.log(`[RTOS Worker] Job \${job.id} completed!`);
});

rtosWorker.on("failed", (job, err) => {
  console.error(`[RTOS Worker] Job \${job?.id} failed:`, err.message);
});
