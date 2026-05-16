import * as cheerio from 'cheerio';
import { URL } from 'url';
export class LinkExtractor {
    static extract(html, baseUrl) {
        const $ = cheerio.load(html);
        const links = new Set();
        $('a[href]').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                try {
                    const resolvedUrl = new URL(href, baseUrl);
                    // Remove hash
                    resolvedUrl.hash = '';
                    links.add(resolvedUrl.toString());
                }
                catch (e) {
                    // Ignore invalid URLs
                }
            }
        });
        return Array.from(links);
    }
}
