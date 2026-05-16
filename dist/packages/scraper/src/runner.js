import { FetchEngine } from './engines/fetch.js';
import { PlaywrightEngine } from './engines/playwright.js';
import { MarkdownTransformer } from './transformers/markdown.js';
export class ScraperRunner {
    engines;
    transformer;
    constructor() {
        this.engines = [
            new FetchEngine(),
            new PlaywrightEngine(),
        ];
        this.transformer = new MarkdownTransformer();
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
