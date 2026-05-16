"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerState = void 0;
const core_1 = require("@crawwl/core");
class CrawlerState {
    static async isVisited(crawlId, url) {
        const key = `crawl:${crawlId}:visited`;
        return (await core_1.redisConnection.sismember(key, url)) === 1;
    }
    static async markVisited(crawlId, url) {
        const key = `crawl:${crawlId}:visited`;
        await core_1.redisConnection.sadd(key, url);
        // Set expiry to 24 hours
        await core_1.redisConnection.expire(key, 24 * 60 * 60);
    }
    static async getPageCount(crawlId) {
        const key = `crawl:${crawlId}:visited`;
        return await core_1.redisConnection.scard(key);
    }
}
exports.CrawlerState = CrawlerState;
