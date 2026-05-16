import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
export class MarkdownTransformer {
    turndown;
    constructor() {
        this.turndown = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
        });
    }
    transform(html) {
        const $ = cheerio.load(html);
        // Noise Cancellation: Remove common non-content elements
        const elementsToRemove = [
            'nav', 'header', 'footer', 'aside', 'script', 'style', 'iframe', 'noscript',
            '.ads', '.advertisement', '.social-share', '.menu', '.sidebar'
        ];
        elementsToRemove.forEach(selector => $(selector).remove());
        // Clean up empty links or divs that might clutter the output
        $('a:empty').remove();
        $('div:empty').remove();
        const cleanedHtml = $('body').html() || html;
        return this.turndown.turndown(cleanedHtml);
    }
}
