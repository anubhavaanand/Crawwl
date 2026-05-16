"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlOptionsSchema = void 0;
const zod_1 = require("zod");
const scraper_1 = require("@crawwl/scraper");
exports.CrawlOptionsSchema = scraper_1.ScrapeOptionsSchema.extend({
    maxDepth: zod_1.z.number().min(0).max(10).default(1),
    limit: zod_1.z.number().min(1).max(1000).default(10),
    allowSubdomains: zod_1.z.boolean().default(false),
    allowBackwardCrawling: zod_1.z.boolean().default(false),
    ignoreRobotsTxt: zod_1.z.boolean().default(false),
    includePatterns: zod_1.z.array(zod_1.z.string()).default([]),
    excludePatterns: zod_1.z.array(zod_1.z.string()).default([]),
});
