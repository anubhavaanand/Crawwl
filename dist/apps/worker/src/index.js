import dotenv from 'dotenv';
import { Worker } from 'bullmq';
import { SCRAPE_QUEUE_NAME, CRAWL_QUEUE_NAME, redisConnection, saveJobResult, logger } from '@crawwl/core';
import { ScraperRunner } from '@crawwl/scraper';
import { CrawlerService } from '@crawwl/crawler';
dotenv.config();
const scraperRunner = new ScraperRunner();
const crawlerService = new CrawlerService();
// Scrape Worker
const scrapeWorker = new Worker(SCRAPE_QUEUE_NAME, async (job) => {
    logger.info(`Processing scrape job ${job.id} for ${job.data.url}`);
    try {
        const result = await scraperRunner.run(job.data);
        await saveJobResult(job.id, result);
        if (result.success) {
            logger.info(`Scrape job ${job.id} succeeded`);
            return result;
        }
        else {
            logger.error(`Scrape job ${job.id} failed: ${result.error}`);
            throw new Error(result.error || 'Scrape failed');
        }
    }
    catch (error) {
        logger.error(`Error processing scrape job ${job.id}: ${error.message}`);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: parseInt(process.env.SCRAPE_CONCURRENCY || '5'),
});
// Crawl Worker
const crawlWorker = new Worker(CRAWL_QUEUE_NAME, async (job) => {
    logger.info(`Processing crawl job ${job.id} for ${job.data.url} (Depth: ${job.data.depth})`);
    try {
        await crawlerService.processJob(job);
        logger.info(`Crawl job ${job.id} completed`);
    }
    catch (error) {
        logger.error(`Error processing crawl job ${job.id}: ${error.message}`);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: parseInt(process.env.CRAWL_CONCURRENCY || '2'),
});
logger.info('Crawwl Workers started and listening for scrape/crawl jobs...');
