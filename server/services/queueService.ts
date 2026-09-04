import { Queue } from "bullmq";
import Redis from "ioredis";

// Centralized Redis connection configuration
export const connection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by bullmq
});

connection.on("error", (err) => {
  console.error("Redis Connection Error:", err.message);
});

connection.on("ready", () => {
  console.log("🟢 Connected to Redis for BullMQ");
});

// Create Queues
export const aiTasksQueue = new Queue("ai-tasks", { connection });
export const rtosEventsQueue = new Queue("rtos-events", { connection });

// Helper function to add a job to the AI queue (e.g. quiz generation or document extraction)
export async function enqueueAITask(jobName: string, data: any) {
  try {
    const job = await aiTasksQueue.add(jobName, data);
    console.log(`[Queue] Added AI task \${jobName} with ID: \${job.id}`);
    return job;
  } catch (error) {
    console.error("Error enqueuing AI task:", error);
    throw error;
  }
}

// Helper function to add a job to the RTOS queue (e.g. competency recalculation)
export async function enqueueRTOSEvent(jobName: string, data: any) {
  try {
    const job = await rtosEventsQueue.add(jobName, data);
    console.log(`[Queue] Added RTOS event \${jobName} with ID: \${job.id}`);
    return job;
  } catch (error) {
    console.error("Error enqueuing RTOS event:", error);
    throw error;
  }
}
