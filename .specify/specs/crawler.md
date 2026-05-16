# Feature Specification: Recursive Crawler

**Feature Branch**: `001-recursive-crawler`

**Created**: 2026-05-17

**Status**: Draft

**Input**: User description: "Rebuild the recursive crawler from scratch, highly optimized for speed and reliability, integrated with the existing ScraperRunner."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Internal Link Discovery (Priority: P1)

As a user, I want to provide a base URL and have the crawler automatically discover and scrape all pages within the same domain up to a certain depth.

**Why this priority**: This is the core functionality of a crawler. Without it, the system only scrapes single URLs.

**Independent Test**: Can be tested by starting a crawl on a small 3-page site and verifying that all 3 pages are scraped and added to the results.

**Acceptance Scenarios**:

1. **Given** a base URL `https://example.com`, **When** I start a crawl with `maxDepth: 1`, **Then** the crawler should scrape `https://example.com` and all links it finds on that page that belong to `example.com`.
2. **Given** a discovered link, **When** it points to an external domain (e.g., `https://google.com`), **Then** it should be ignored by default.

---

### User Story 2 - Depth and Limit Constraints (Priority: P2)

As a user, I want to limit the crawl by depth and total page count to prevent runaway crawls and manage costs.

**Why this priority**: Essential for production reliability and resource management.

**Independent Test**: Trigger a crawl on a large site with `limit: 5` and verify that exactly 5 pages are scraped regardless of how many more links are found.

**Acceptance Scenarios**:

1. **Given** a `maxDepth` of 2, **When** the crawler reaches depth 3, **Then** it should stop following links discovered at that level.
2. **Given** a `limit` of 10, **When** 10 pages have been successfully scraped, **Then** all pending crawl jobs for that `crawlId` should be cancelled or ignored.

---

### User Story 3 - Robots.txt & Exclusion Rules (Priority: P3)

As a user, I want the crawler to respect `robots.txt` and my custom exclusion patterns to ensure ethical and targeted crawling.

**Why this priority**: Necessary for ethical scraping and avoiding unwanted parts of a site (e.g., `/admin`, `/login`).

**Independent Test**: Provide an exclusion pattern `/*?*` and verify that URLs with query parameters are not crawled.

**Acceptance Scenarios**:

1. **Given** a `robots.txt` that disallows `/private`, **When** the crawler finds a link to `/private`, **Then** it should not follow it.
2. **Given** an exclusion regex `/\.pdf$/`, **When** a link to a PDF is found, **Then** it should be ignored.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain a "visited" set in Redis to prevent duplicate scraping of the same URL within a single crawl session.
- **FR-002**: System MUST use a non-blocking, distributed architecture (BullMQ) to handle link discovery and scraping concurrently.
- **FR-003**: System MUST support absolute and relative URL normalization.
- **FR-004**: System MUST allow users to specify `include` and `exclude` patterns using Regex.
- **FR-005**: System MUST provide a unique `crawlId` for each session to group results.

### Key Entities

- **CrawlSession**: Represents a single crawling task. Attributes: `crawlId`, `baseUrl`, `options` (depth, limit, etc.), `status`.
- **CrawlJob**: An atomic unit of work representing a single URL to be crawled. Attributes: `url`, `depth`, `crawlId`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Crawler can discover and queue 100 internal links from a single page in under 500ms (extraction & filtering only).
- **SC-002**: System handles 10 concurrent crawls across different domains without performance degradation in the queue.
- **SC-003**: 100% compliance with `robots.txt` instructions for the specified User-Agent.

## Assumptions

- Users understand that very deep crawls on large sites may take significant time and resources.
- The system will use the existing `ScraperRunner` for the actual content fetching.
- Redis is available and configured for state management.
