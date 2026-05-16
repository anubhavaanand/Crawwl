import { z } from 'zod';

export const ScrapeFormatSchema = z.enum(['markdown', 'html', 'rawHtml', 'json', 'screenshot']);

export const ScrapeOptionsSchema = z.object({
  url: z.string().url(),
  formats: z.array(ScrapeFormatSchema).default(['markdown']),
  timeout: z.number().optional().default(30000),
  waitFor: z.number().optional().default(0),
  mobile: z.boolean().optional().default(false),
  skipTlsVerification: z.boolean().optional().default(true),
  proxy: z.enum(['none', 'auto', 'stealth']).optional().default('auto'),
});

export type ScrapeOptions = z.infer<typeof ScrapeOptionsSchema>;

export interface ScrapeResult {
  success: boolean;
  url: string;
  statusCode: number;
  markdown?: string;
  html?: string;
  rawHtml?: string;
  screenshot?: string;
  error?: string;
  metadata: Record<string, any>;
}

export interface IScraperEngine {
  name: string;
  scrape(options: ScrapeOptions): Promise<ScrapeResult>;
}
