import robotsParser from 'robots-parser';
import axios from 'axios';
import { logger } from '@crawwl/core';

export class RobotsManager {
  private cache: Map<string, any> = new Map();

  public async isAllowed(url: string, userAgent: string = '*'): Promise<boolean> {
    try {
      const parsedUrl = new URL(url);
      const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;

      let robots = this.cache.get(robotsUrl);

      if (!robots) {
        try {
          const response = await axios.get(robotsUrl, { timeout: 5000 });
          robots = robotsParser(robotsUrl, response.data);
          this.cache.set(robotsUrl, robots);
        } catch (e) {
          // If robots.txt doesn't exist or fails, assume everything is allowed
          return true;
        }
      }

      return robots.isAllowed(url, userAgent) ?? true;
    } catch (e) {
      return true;
    }
  }
}
