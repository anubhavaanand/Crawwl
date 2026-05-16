import { z } from 'zod';
import { ScrapeOptionsSchema } from '@crawwl/scraper';

export const CrawlOptionsSchema = ScrapeOptionsSchema.extend({
  maxDepth: z.number().min(0).max(10).default(1),
  limit: z.number().min(1).max(1000).default(10),
  allowSubdomains: z.boolean().default(false),
  allowBackwardCrawling: z.boolean().default(false),
  ignoreRobotsTxt: z.boolean().default(false),
  includePatterns: z.array(z.string()).default([]),
  excludePatterns: z.array(z.string()).default([]),
});

export type CrawlOptions = z.infer<typeof CrawlOptionsSchema>;

export interface CrawlResult {
  crawlId: string;
  baseUrl: string;
  pagesCrawled: number;
  results: any[]; // Links to scraped results
  status: 'active' | 'completed' | 'failed' | 'cancelled';
}

export interface CrawlJobData {
  url: string;
  depth: number;
  crawlId: string;
  options: CrawlOptions;
}
