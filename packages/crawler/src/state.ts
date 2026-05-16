import { redisConnection } from '@crawwl/core';

export class CrawlerState {
  public static async isVisited(crawlId: string, url: string): Promise<boolean> {
    const key = `crawl:${crawlId}:visited`;
    return (await redisConnection.sismember(key, url)) === 1;
  }

  public static async markVisited(crawlId: string, url: string): Promise<void> {
    const key = `crawl:${crawlId}:visited`;
    await redisConnection.sadd(key, url);
    // Set expiry to 24 hours
    await redisConnection.expire(key, 24 * 60 * 60);
  }

  public static async getPageCount(crawlId: string): Promise<number> {
    const key = `crawl:${crawlId}:visited`;
    return await redisConnection.scard(key);
  }
}
