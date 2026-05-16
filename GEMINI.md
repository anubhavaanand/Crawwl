# Crawwl - Production-Ready Scraper & Crawler

Crawwl is a high-performance web scraping and crawling platform designed for AI agents and LLM applications. It is a clean, original rebuild focused on efficiency and reliability.

## Core Mandates

- **Originality:** All implementations must be original, based on deep architectural insights and modern engineering practices.
- **Production-Ready:** Focus on scalability, error handling, and observability.
- **Efficiency:** Optimized for high-throughput crawling and clean Markdown output for LLMs.

## Tech Stack

- **Runtime:** Node.js (TypeScript)
- **API Framework:** Express.js
- **Task Queue:** BullMQ (Redis) - Chosen for simplicity and robustness.
- **Database:** PostgreSQL (using Drizzle ORM for type safety).
- **Scraping Engines:** Playwright (Browser), Fetch (Fast), TLS Client (Stealth).
- **AI Integration:** AI SDK (OpenAI, Anthropic, etc.).

## Project Structure

- `apps/api`: Main API server and job dispatcher.
- `apps/worker`: Background worker for processing scraping and crawling jobs.
- `packages/core`: Shared logic, types, and utilities.
- `packages/scraper`: The unified scraping engine and transformation logic.

## Implementation Phases

1. **Phase 1: Foundation & API:** Setup Express, Zod validation, and basic project structure.
2. **Phase 2: Scraper Engine:** Implement the multi-engine waterfall logic.
3. **Phase 3: Queue & Worker:** Set up BullMQ for job management.
4. **Phase 4: Transformation & AI:** Markdown conversion and structured extraction.
5. **Phase 5: Performance & Anti-bot:** Advanced retry logic and proxy rotation.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
