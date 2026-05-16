import { Router } from 'express';
import { ScrapeOptionsSchema } from '@crawwl/scraper';
import { scrapeQueue, getJobResult } from '@crawwl/core';
import { logger } from '../lib/logger.js';
import { v7 as uuidv7 } from 'uuid';

export const v1Router = Router();

v1Router.post('/scrape', async (req, res) => {
  try {
    const options = ScrapeOptionsSchema.parse(req.body);
    const jobId = uuidv7();
    
    logger.info(`Adding scrape job ${jobId} for ${options.url}`);
    
    await scrapeQueue.add('scrape', options, { jobId });

    res.status(202).json({ 
      success: true, 
      message: 'Scrape job received',
      jobId 
    });
  } catch (error: any) {
    logger.error(`Error adding scrape job: ${error.message}`);
    res.status(400).json({ success: false, error: error.errors || error.message });
  }
});

v1Router.get('/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const result = await getJobResult(jobId);

  if (!result) {
    // Check if it's still in the queue
    const job = await scrapeQueue.getJob(jobId);
    if (job) {
      return res.json({ status: 'pending' });
    }
    return res.status(404).json({ success: false, error: 'Job not found' });
  }

  res.json({ status: 'completed', data: result });
});

v1Router.post('/crawl', async (req, res) => {
  // Skeleton for crawl
  res.status(202).json({ 
    success: true, 
    message: 'Crawl job received',
    jobId: 'placeholder-uuid' 
  });
});
