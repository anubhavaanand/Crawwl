"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerService = void 0;
const scraper_1 = require("@crawwl/scraper");
const extractor_js_1 = require("./extractor.js");
const filter_js_1 = require("./filter.js");
const robots_js_1 = require("./robots.js");
const state_js_1 = require("./state.js");
const core_1 = require("@crawwl/core");
class CrawlerService {
    scraperRunner;
    robotsManager;
    constructor() {
        this.scraperRunner = new scraper_1.ScraperRunner();
        this.robotsManager = new robots_js_1.RobotsManager();
    }
    async processJob(job) {
        const { url, depth, crawlId, options } = job.data;
        // 1. Check if already visited or limit reached
        if (await state_js_1.CrawlerState.isVisited(crawlId, url))
            return;
        const count = await state_js_1.CrawlerState.getPageCount(crawlId);
        if (count >= options.limit)
            return;
        // 2. Ethical Check (Robots.txt)
        if (!options.ignoreRobotsTxt) {
            const allowed = await this.robotsManager.isAllowed(url);
            if (!allowed)
                return;
        }
        // 3. Mark as visited
        await state_js_1.CrawlerState.markVisited(crawlId, url);
        // 4. Scrape the content
        const result = await this.scraperRunner.run(options);
        // 5. Save individual page result
        await (0, core_1.saveJobResult)(`${crawlId}:${url}`, result);
        // 6. Discover and Queue new links if depth allows
        if (depth < options.maxDepth && result.success && result.html) {
            const links = extractor_js_1.LinkExtractor.extract(result.html, url);
            for (const link of links) {
                if (filter_js_1.RuleEngine.shouldFollow(link, options.url, options)) {
                    // Check if already visited (early exit before queuing)
                    if (!(await state_js_1.CrawlerState.isVisited(crawlId, link))) {
                        await core_1.crawlQueue.add('crawl', {
                            url: link,
                            depth: depth + 1,
                            crawlId,
                            options
                        });
                    }
                }
            }
        }
    }
}
exports.CrawlerService = CrawlerService;
