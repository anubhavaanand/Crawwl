"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperRunner = void 0;
const fetch_js_1 = require("./engines/fetch.js");
const playwright_js_1 = require("./engines/playwright.js");
const markdown_js_1 = require("./transformers/markdown.js");
class ScraperRunner {
    engines;
    transformer;
    constructor() {
        this.engines = [
            new fetch_js_1.FetchEngine(),
            new playwright_js_1.PlaywrightEngine(),
        ];
        this.transformer = new markdown_js_1.MarkdownTransformer();
    }
    async run(options) {
        let lastResult = null;
        for (const engine of this.engines) {
            if (options.formats.includes('screenshot') && engine.name === 'fetch') {
                continue;
            }
            const result = await engine.scrape(options);
            if (result.success && result.html && options.formats.includes('markdown')) {
                result.markdown = this.transformer.transform(result.html);
            }
            lastResult = result;
            if (result.success) {
                return result;
            }
            if (result.statusCode === 404) {
                return result;
            }
        }
        return lastResult;
    }
}
exports.ScraperRunner = ScraperRunner;
