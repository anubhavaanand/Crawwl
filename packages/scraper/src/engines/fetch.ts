import { IScraperEngine, ScrapeOptions, ScrapeResult } from '../types.js';
import axios from 'axios';

export class FetchEngine implements IScraperEngine {
  name = 'fetch';

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    try {
      const response = await axios.get(options.url, {
        timeout: options.timeout,
        validateStatus: () => true,
        headers: {
          'User-Agent': options.mobile 
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        }
      });

      return {
        success: response.status >= 200 && response.status < 300,
        url: options.url,
        statusCode: response.status,
        html: response.data,
        rawHtml: response.data,
        metadata: {
          engine: this.name,
          contentType: response.headers['content-type'],
        }
      };
    } catch (error: any) {
      return {
        success: false,
        url: options.url,
        statusCode: error.response?.status || 500,
        error: error.message,
        metadata: {
          engine: this.name,
        }
      };
    }
  }
}
