import { Job, Worker } from "bullmq";
import prisma  from "@repo/Database/prismaClient";
import { Redis } from "ioredis";
const connection = new Redis({ maxRetriesPerRequest: null });
const chatInsertionWorker = new Worker(
  "dbInsertionQueue",
  async (job: Job) => {
    // console.log("worker up! " + JSON.stringify(job.data));
    console.log("job: ", job); 
    console.log(`roomId: ${job.data.roomId}, userId: ${job.data.userId}, message: ${job.data.message}`)
    try {
      await prisma.chat.create({
        data: {
          roomId: job.data.roomId,
          userId: job.data.userId,
          message: job.data.message,
        },
      });
      console.log("Message stored successfully!");
      return true;
    } catch (err: any) {
      console.log("Error inserting chat: " + err);
    }
  },
  { connection }
);
