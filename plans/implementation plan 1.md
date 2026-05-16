# Implementation Plan 1: Spec-Driven Development with Crawwl

This plan outlines the adoption of **GitHub Spec Kit** for the Crawwl project, ensuring all future development is spec-driven, optimized, and built from scratch.

## 1. Project Constitution (`/constitution`)
Establish the foundational, immutable rules for Crawwl.
- **Originality:** Zero tolerance for copied code.
- **Performance:** Native TypeScript optimization (avoiding unnecessary foreign bridges where possible).
- **Architecture:** Monorepo with strictly decoupled modules.
- **Output:** Clean, semantic Markdown optimized for LLM consumption.

## 2. Specification Phase (`/specify`)
Define the **Recursive Crawler** requirements.
- **Domain Mapping:** Ability to discover all internal links.
- **Constraint Handling:** Depth limits, domain restrictions, and robots.txt compliance.
- **Concurrency:** Intelligent load management per domain.
- **Integration:** Seamless handover of discovered URLs to the `ScraperRunner`.

## 3. Technical Planning (`/plan`)
Design the technical implementation of the crawler.
- **Queue Logic:** Leveraging BullMQ for distributed task management.
- **Link Extraction:** Cheerio-based high-speed HTML parsing.
- **Deduplication:** Redis-backed Bloom filters or Sets for efficient "visited" tracking.

## 4. Task Breakdown (`/tasks`)
1. Initialize `@github/spec-kit` in the root directory.
2. Draft the `.spec-kit/constitution.md`.
3. Create the `.spec-kit/specs/crawler.md`.
4. Create the `.spec-kit/plans/crawler-implementation.md`.
5. Break down into actionable JIRA-style tasks.

## 5. Execution Phase (`/implement`)
Proceed with coding the `@crawwl/crawler` package following the approved specs and plans.
