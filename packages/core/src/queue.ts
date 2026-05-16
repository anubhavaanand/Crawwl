import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const SCRAPE_QUEUE_NAME = 'scrape-jobs';
export const CRAWL_QUEUE_NAME = 'crawl-jobs';

export const scrapeQueue = new Queue(SCRAPE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});
