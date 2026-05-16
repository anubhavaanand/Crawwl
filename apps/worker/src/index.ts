import dotenv from 'dotenv';
import { Worker, Job } from 'bullmq';
import { SCRAPE_QUEUE_NAME, redisConnection, saveJobResult } from '@crawwl/core';
import { ScraperRunner, ScrapeOptions } from '@crawwl/scraper';
import winston from 'winston';

dotenv.config();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

const scraperRunner = new ScraperRunner();

const worker = new Worker(
  SCRAPE_QUEUE_NAME,
  async (job: Job<ScrapeOptions>) => {
    logger.info(`Processing job ${job.id} for ${job.data.url}`);
    
    try {
      const result = await scraperRunner.run(job.data);
      
      // Save result to Redis for retrieval
      await saveJobResult(job.id!, result);

      if (result.success) {
        logger.info(`Job ${job.id} succeeded`);
        return result;
      } else {
        logger.error(`Job ${job.id} failed: ${result.error}`);
        throw new Error(result.error || 'Scrape failed');
      }
    } catch (error: any) {
      logger.error(`Error processing job ${job.id}: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
  }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});

logger.info('Crawwl Worker started and listening for jobs...');
