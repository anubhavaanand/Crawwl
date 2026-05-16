import { chromium, Browser, Page } from 'playwright';
import { IScraperEngine, ScrapeOptions, ScrapeResult } from '../types.js';

export class PlaywrightEngine implements IScraperEngine {
  name = 'playwright';

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    let browser: Browser | null = null;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: options.mobile 
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
          : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();
      
      const response = await page.goto(options.url, {
        waitUntil: 'networkidle',
        timeout: options.timeout,
      });

      if (options.waitFor) {
        await page.waitForTimeout(options.waitFor);
      }

      const html = await page.content();
      const statusCode = response?.status() || 200;

      let screenshot: string | undefined;
      if (options.formats.includes('screenshot')) {
        const buffer = await page.screenshot({ fullPage: true });
        screenshot = buffer.toString('base64');
      }

      return {
        success: statusCode >= 200 && statusCode < 300,
        url: options.url,
        statusCode,
        html,
        rawHtml: html,
        screenshot,
        metadata: {
          engine: this.name,
          title: await page.title(),
        }
      };
    } catch (error: any) {
      return {
        success: false,
        url: options.url,
        statusCode: 500,
        error: error.message,
        metadata: {
          engine: this.name,
        }
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
