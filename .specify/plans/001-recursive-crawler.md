# Implementation Plan: Recursive Crawler

**Branch**: `001-recursive-crawler` | **Date**: 2026-05-17 | **Spec**: `.specify/specs/crawler.md`

## Summary
The goal is to implement a high-performance recursive crawler as a new package `@crawwl/crawler`. It will use the existing `@crawwl/scraper` to fetch content, BullMQ for distributed task orchestration, and Redis for O(1) URL deduplication and state tracking.

## Technical Context

**Language/Version**: TypeScript 5.4.5 (Node.js 20+)

**Primary Dependencies**: 
- `@crawwl/scraper` (Internal)
- `bullmq` (Queue management)
- `ioredis` (Redis client)
- `cheerio` (Link extraction)
- `robots-parser` (Ethical crawling)

**Storage**: Redis (Visited sets, crawler state)

**Testing**: Vitest (Unit & Integration)

**Target Platform**: Linux (Docker-ready)

**Project Type**: Monorepo Package (Library + Background Worker)

**Performance Goals**: Link extraction & filtering < 50ms per page.

**Constraints**: < 200MB memory per worker instance.

## Constitution Check

- **Originality**: YES. Logic built from scratch using BullMQ patterns.
- **Production-First**: YES. Uses robust queues and structured logging.
- **LLM-Optimized**: YES. Leverages `@crawwl/scraper`'s noise-canceling Markdown.
- **Type Safety**: YES. Full Zod validation for crawler options.

## Project Structure

### Documentation
```text
.specify/specs/
└── crawler.md           # Specification
.specify/plans/
└── 001-recursive-crawler.md # This plan
```

### Source Code
```text
packages/crawler/
├── src/
│   ├── index.ts         # Public API
│   ├── types.ts         # Zod schemas
│   ├── extractor.ts     # Link discovery logic
│   ├── filter.ts        # Rules engine (robots.txt, regex)
│   └── service.ts       # BullMQ orchestration logic
├── tests/
│   ├── extractor.test.ts
│   └── filter.test.ts
└── package.json
```

**Structure Decision**: A new standalone package `@crawwl/crawler` within the monorepo to maintain strict decoupling from the API and Scraper.

## Implementation Steps

### Phase 1: Logic Core
1.  Implement `LinkExtractor` using Cheerio to find all `a[href]` and resolve relative URLs.
2.  Implement `RuleEngine` to filter links by domain, depth, and regex.
3.  Integrate `robots-parser` to handle `robots.txt` compliance.

### Phase 2: Orchestration
1.  Create `CrawlQueue` in BullMQ.
2.  Implement the `CrawlWorker` which:
    - Checks Redis for URL deduplication.
    - Calls `ScraperRunner` for content.
    - Discovers new links.
    - Queues next-level crawl jobs if depth allows.

### Phase 3: Integration
1.  Expose `/v1/crawl` endpoint in `@crawwl/api`.
2.  Implement a progress tracker using Redis to show how many pages have been crawled.
