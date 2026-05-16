import { ScraperRunner } from '@crawwl/scraper';
import { LinkExtractor } from './extractor.js';
import { RuleEngine } from './filter.js';
import { RobotsManager } from './robots.js';
import { CrawlerState } from './state.js';
import { crawlQueue, saveJobResult } from '@crawwl/core';
export class CrawlerService {
    scraperRunner;
    robotsManager;
    constructor() {
        this.scraperRunner = new ScraperRunner();
        this.robotsManager = new RobotsManager();
    }
    async processJob(job) {
        const { url, depth, crawlId, options } = job.data;
        // 1. Check if already visited or limit reached
        if (await CrawlerState.isVisited(crawlId, url))
            return;
        const count = await CrawlerState.getPageCount(crawlId);
        if (count >= options.limit)
            return;
        // 2. Ethical Check (Robots.txt)
        if (!options.ignoreRobotsTxt) {
            const allowed = await this.robotsManager.isAllowed(url);
            if (!allowed)
                return;
        }
        // 3. Mark as visited
        await CrawlerState.markVisited(crawlId, url);
        // 4. Scrape the content
        const result = await this.scraperRunner.run(options);
        // 5. Save individual page result
        await saveJobResult(`${crawlId}:${url}`, result);
        // 6. Discover and Queue new links if depth allows
        if (depth < options.maxDepth && result.success && result.html) {
            const links = LinkExtractor.extract(result.html, url);
            for (const link of links) {
                if (RuleEngine.shouldFollow(link, options.url, options)) {
                    // Check if already visited (early exit before queuing)
                    if (!(await CrawlerState.isVisited(crawlId, link))) {
                        await crawlQueue.add('crawl', {
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
