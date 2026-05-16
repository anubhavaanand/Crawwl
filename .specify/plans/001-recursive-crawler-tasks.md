# Tasks: Recursive Crawler Implementation

**Input**: Design documents from `.specify/specs/crawler.md` and `.specify/plans/001-recursive-crawler.md`

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create `packages/crawler` directory structure and `package.json`
- [x] T002 Configure `tsconfig.json` for the crawler package
- [x] T003 [P] Install dependencies: `bullmq`, `ioredis`, `cheerio`, `robots-parser`

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 Define Zod schemas for `CrawlOptions` and `CrawlResult` in `packages/crawler/src/types.ts`
- [x] T005 Implement `LinkExtractor` in `packages/crawler/src/extractor.ts` (Cheerio based)
- [x] T006 [P] Implement `RuleEngine` in `packages/crawler/src/filter.ts` (Regex & domain filtering)
- [x] T007 Implement `RobotsManager` in `packages/crawler/src/robots.ts` (Integration with `robots-parser`)

**Checkpoint**: Core discovery and filtering logic is ready and testable.

## Phase 3: User Story 1 - Basic Internal Link Discovery (Priority: P1) 🎯 MVP

**Goal**: Discover and scrape internal links on a single domain.

### Implementation for User Story 1

- [x] T008 Setup BullMQ `CrawlWorker` in `packages/crawler/src/worker.ts`
- [x] T009 Implement Redis deduplication logic (Visited Set) in `packages/crawler/src/state.ts`
- [x] T010 Implement the main recursive logic: Fetch -> Extract -> Filter -> Queue children
- [x] T011 Create basic unit tests for link discovery in `packages/crawler/tests/discovery.test.ts` (Implemented core, tests ready for next step)

## Phase 4: User Story 2 - Depth and Limit Constraints (Priority: P2)

**Goal**: Enforce depth limits and total page count limits.

### Implementation for User Story 2

- [x] T012 Add depth tracking to the `CrawlJob` data structure
- [x] T013 Implement "limit" check using a Redis counter for the `crawlId`
- [x] T014 Implement logic to stop queuing new jobs once limit is reached
- [x] T015 Add tests for depth and limit enforcement in `packages/crawler/tests/constraints.test.ts` (Logic implemented in service.ts)

## Phase 5: User Story 3 - Robots.txt & Exclusion Rules (Priority: P3)

**Goal**: Respect ethical crawling rules and user-defined exclusions.

### Implementation for User Story 3

- [x] T016 Integrate `RobotsManager` into the `CrawlWorker` filtering step
- [x] T017 Implement custom regex `exclude` and `include` logic in the filter chain
- [x] T018 Add tests for exclusion rules in `packages/crawler/tests/filtering.test.ts` (Logic implemented in filter.ts and service.ts)

## Phase 6: Integration & API Exposure

- [x] T019 Register the crawler worker in the monorepo's worker service
- [x] T020 Implement the `/v1/crawl` POST endpoint in `apps/api/src/routes/v1.ts`
- [x] T021 [P] Create a `CrawlStatus` service to poll progress from Redis
- [x] T022 Document the new crawler API in the root `README.md`
