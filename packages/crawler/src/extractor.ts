import * as cheerio from 'cheerio';
import { URL } from 'url';

export class LinkExtractor {
  public static extract(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links = new Set<string>();

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const resolvedUrl = new URL(href, baseUrl);
          // Remove hash
          resolvedUrl.hash = '';
          links.add(resolvedUrl.toString());
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    return Array.from(links);
  }
}
