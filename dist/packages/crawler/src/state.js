import { redisConnection } from '@crawwl/core';
export class CrawlerState {
    static async isVisited(crawlId, url) {
        const key = `crawl:${crawlId}:visited`;
        return (await redisConnection.sismember(key, url)) === 1;
    }
    static async markVisited(crawlId, url) {
        const key = `crawl:${crawlId}:visited`;
        await redisConnection.sadd(key, url);
        // Set expiry to 24 hours
        await redisConnection.expire(key, 24 * 60 * 60);
    }
    static async getPageCount(crawlId) {
        const key = `crawl:${crawlId}:visited`;
        return await redisConnection.scard(key);
    }
}
