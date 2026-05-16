# Crawwl Constitution

## Core Principles

### I. Absolute Originality
Every line of code in the Crawwl project must be original. We leverage architectural insights from industry-leading scrapers, but all implementations are built from the ground up. Direct reuse or copying of original source code is strictly prohibited.

### II. Production-First & Scalable
We build for production. This means high-quality error handling, robust observability (structured logging), and a scalable architecture (monorepo, distributed queues). We favor simplicity and robustness (e.g., BullMQ) over complex, custom-built solutions when industry standards are superior.

### III. LLM-Optimized Output
The primary consumer of Crawwl data is an AI Agent. All scraping and crawling outputs must be optimized for LLMs. This includes aggressive noise cancellation (stripping ads, navs, footers) and semantic Markdown transformation.

### IV. Type Safety & Predictability
We use TypeScript with strict mode enabled. All external inputs (API requests, database rows) must be validated using Zod. We favor explicit composition over complex inheritance.

### V. Spec-Driven Development (SDD)
All major features must follow the SDD workflow:
1. **Constitution:** Define the principles.
2. **Specify:** What and Why.
3. **Plan:** How.
4. **Tasks:** Actionable steps.
5. **Implement:** Code.

## Technology Stack
- **Language:** TypeScript (Node.js)
- **Framework:** Express.js
- **Queue:** BullMQ (Redis)
- **Database:** PostgreSQL (Drizzle ORM)
- **Engines:** Playwright (Browser), Fetch (HTTP)

## Governance
This Constitution is the source of truth for all architectural decisions. Any deviations must be justified and documented in a revised version.

**Version**: 1.0.0 | **Ratified**: 2026-05-17 | **Last Amended**: 2026-05-17
