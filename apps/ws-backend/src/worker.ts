import { Job, Worker } from "bullmq";
import prisma  from "@repo/Database/prismaClient";
import { Redis } from "ioredis";
const connection = new Redis({ maxRetriesPerRequest: null });
const chatInsertionWorker = new Worker(
  "dbInsertionQueue",
  async (job: Job) => {
    // console.log("worker up! " + JSON.stringify(job.data));
    // console.log("job: ", job); 
    // console.log(`roomId: ${job.data.roomId}, userId: ${job.data.userId}, message: ${job.data.message}`)
    try {
      await prisma.geometry.create({
        data: {
          roomId: job.data.roomId,
          userId: job.data.userId,
          startX: job.data.startX,
          startY: job.data.startY,
          width: job.data.width,
          height: job.data.height,
          shape: job.data.shape,
          text: job.data.text,
          path:job.data.path
        },
      });
      console.log("Shape stored successfully!");
      return true;
    } catch (err: any) {
      console.log("Error inserting chat: " + err);
    }
  },
  { connection }
);
