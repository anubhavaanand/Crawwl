import { URL } from 'url';
import { CrawlOptions } from './types.js';

export class RuleEngine {
  public static shouldFollow(url: string, baseUrl: string, options: CrawlOptions): boolean {
    try {
      const targetUrl = new URL(url);
      const base = new URL(baseUrl);

      // 1. Domain Check
      const isSameDomain = targetUrl.hostname === base.hostname;
      const isSubdomain = targetUrl.hostname.endsWith(`.${base.hostname}`);

      if (!isSameDomain && (!options.allowSubdomains || !isSubdomain)) {
        return false;
      }

      // 2. Exclusion Patterns
      for (const pattern of options.excludePatterns) {
        if (new RegExp(pattern).test(url)) {
          return false;
        }
      }

      // 3. Inclusion Patterns
      if (options.includePatterns.length > 0) {
        let matched = false;
        for (const pattern of options.includePatterns) {
          if (new RegExp(pattern).test(url)) {
            matched = true;
            break;
          }
        }
        if (!matched) return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
