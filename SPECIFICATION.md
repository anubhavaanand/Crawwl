# Crawwl Specification

## Project Charter

Crawwl is a **production-ready, AI-optimized web scraping and crawling platform** for agents and LLM applications. It transforms websites into clean, structured Markdown or JSON for LLM consumption.

### Core Mandates
- **Originality:** No direct copying of Firecrawl code; all implementations original
- **Production-Ready:** Focus on scalability, error handling, and observability
- **Efficiency:** High-throughput crawling with clean Markdown output for LLMs

---

## Architecture

### High-Level Components

```
Client
  ↓
API Server (apps/api)
  ├→ POST /v1/scrape          [Create scrape job]
  ├→ GET /v1/jobs/:id         [Check job status]
  └→ POST /v1/crawl           [Create crawl job]
  ↓
Job Queue (BullMQ + Redis)
  ├→ scrape-jobs queue
  └→ crawl-jobs queue (planned)
  ↓
Worker Processes (apps/worker)
  ├→ Scraper Engine
  │   ├→ Fetch (Axios)
  │   ├→ Playwright (Browser)
  │   └→ TLS Client (planned)
  ├→ Transformers
  │   └→ Markdown (Turndown)
  └→ Output Storage (Redis + PostgreSQL)
```

### Packages

| Package | Purpose | Status |
|---------|---------|--------|
| `@crawwl/core` | Shared utilities: queue, storage, types, logger | ✅ Ready |
| `@crawwl/scraper` | Scraping engines, transformers, orchestration | ✅ Ready |
| `@crawwl/crawler` | Link discovery, deduplication, recursive crawling | ❌ Planned |

---

## API Specification

### POST /v1/scrape

**Request:**
```json
{
  "url": "https://example.com",
  "formats": ["markdown", "html", "screenshot"],
  "timeout": 30000,
  "waitFor": 0,
  "mobile": false,
  "skipTlsVerification": true,
  "proxy": "auto"
}
```

**Response (202 Accepted):**
```json
{
  "jobId": "01-abc123-def456",
  "status": "pending",
  "url": "https://example.com"
}
```

**GET /v1/jobs/:jobId**

**Response (200 OK):**
```json
{
  "jobId": "01-abc123-def456",
  "status": "completed",
  "result": {
    "success": true,
    "url": "https://example.com",
    "statusCode": 200,
    "markdown": "# Example\n...",
    "html": "<html>...",
    "screenshot": "base64...",
    "metadata": {}
  }
}
```

### POST /v1/crawl (Planned)

**Request:**
```json
{
  "urls": ["https://example.com"],
  "maxPages": 100,
  "formats": ["markdown"],
  "crawlDelay": 1000,
  "respectRobotsTxt": true
}
```

---

## Data Models

### ScrapeOptions (Input)

```typescript
interface ScrapeOptions {
  url: string;
  formats: ('markdown' | 'html' | 'rawHtml' | 'json' | 'screenshot')[];
  timeout?: number;              // Default: 30000ms
  waitFor?: number;              // Delay after page load (ms)
  mobile?: boolean;              // Default: false
  skipTlsVerification?: boolean; // Default: true
  proxy?: 'none' | 'auto' | 'stealth'; // Default: 'auto'
}
```

### ScrapeResult (Output)

```typescript
interface ScrapeResult {
  success: boolean;
  url: string;
  statusCode: number;
  markdown?: string;      // Noise-filtered, LLM-optimized
  html?: string;
  rawHtml?: string;
  json?: Record<string, any>;
  screenshot?: string;    // Base64 image
  error?: string;         // If success: false
  metadata: Record<string, any>;
}
```

### Job Record (Redis + PostgreSQL)

```typescript
interface JobRecord {
  jobId: string;          // UUID v7
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: ScrapeOptions;
  result?: ScrapeResult;
  error?: string;
  retries: number;
  createdAt: timestamp;
  updatedAt: timestamp;
  expiresAt: timestamp;   // Redis TTL: 24h
}
```

---

## Implementation Requirements

### Phase 1: Foundation (DONE)
- [x] Express API server with health endpoint
- [x] BullMQ queue configuration
- [x] Redis connection pooling
- [x] Winston logger

### Phase 2: Scraper Engine (DONE)
- [x] Fetch engine (Axios)
- [x] Playwright engine (browser)
- [x] Waterfall orchestration (Fetch → Playwright)
- [x] Screenshot capture
- [x] Mobile user-agent support
- [ ] **TLS Client engine** (stealth scraping)

### Phase 3: Transformers (DONE)
- [x] Markdown transformer (Turndown + noise cancellation)
- [ ] **JSON transformer** (structured extraction)
- [ ] **HTML minimizer** (compress irrelevant tags)

### Phase 4: API & Worker (DONE)
- [x] POST /v1/scrape endpoint
- [x] GET /v1/jobs/:id endpoint
- [x] BullMQ worker with job processor
- [x] Result storage (Redis)
- [ ] **Crawl endpoints** (skeleton exists)
- [ ] **Middleware:** validation, auth, error handling
- [ ] **Controllers:** endpoint logic extraction

### Phase 5: Data Persistence (PARTIAL)
- [x] Redis result caching (24h TTL)
- [ ] **PostgreSQL integration** (Drizzle ORM)
- [ ] **Job history tracking**
- [ ] **Metrics/analytics tables**

### Phase 6: Crawler Module (PLANNED)
- [ ] **@crawwl/crawler package**
- [ ] **Link extraction** (cheerio, regex)
- [ ] **Deduplication** (Bloom filters, visited set)
- [ ] **Crawl queue** (BullMQ)
- [ ] **Robots.txt respect**
- [ ] **Sitemap parsing**

### Phase 7: Advanced Features (PLANNED)
- [ ] **Proxy rotation** (implementation; schema exists)
- [ ] **Circuit breaker** (exponential backoff + threshold)
- [ ] **Dead-letter queue** (failed jobs)
- [ ] **Manual retry API**
- [ ] **AI integration** (OpenAI, Anthropic SDKs)
- [ ] **Structured extraction** (schema-based output)
- [ ] **Config management** (env schema validation)

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **API** | Express.js, TypeScript | REST endpoints |
| **Queue** | BullMQ + Redis | Async job processing |
| **Scraper** | Fetch (Axios), Playwright | HTTP + browser engines |
| **Transform** | Turndown, Cheerio | HTML → Markdown/JSON |
| **Storage** | Redis, PostgreSQL (planned) | Job state + history |
| **Validation** | Zod | Request/type safety |
| **Logging** | Winston | Structured logs |
| **Package Mgr** | pnpm | Monorepo management |

---

## Configuration

### Environment Variables (Planned Schema)

```typescript
interface ConfigSchema {
  // API
  API_PORT: number;           // Default: 3000
  API_HOST: string;           // Default: 0.0.0.0
  
  // Redis
  REDIS_URL: string;          // Default: redis://localhost:6379
  REDIS_PASSWORD?: string;
  
  // Worker
  WORKER_CONCURRENCY: number; // Default: 5
  WORKER_TIMEOUT_MS: number;  // Default: 60000
  
  // Database
  DATABASE_URL: string;       // PostgreSQL connection
  
  // Logging
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  
  // Features
  ENABLE_PROXY_ROTATION: boolean;
  ENABLE_STEALTH_MODE: boolean;
  
  // Limits
  MAX_PAGE_SIZE: number;      // Default: 10MB
  MAX_CRAWL_DEPTH: number;    // Default: 5
  JOB_RETENTION_HOURS: number; // Default: 24
}
```

---

## Error Handling Strategy

### HTTP Status Codes
- `200 OK` - Job found (completed/failed)
- `202 Accepted` - Job created, processing async
- `400 Bad Request` - Invalid input (validation error)
- `404 Not Found` - Job not found or expired
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Unexpected failure

### Retry Strategy
- **Automatic:** Exponential backoff (1s → 2s → 4s), max 3 attempts
- **Manual:** PUT /v1/jobs/:id/retry (planned)
- **Dead-letter:** Jobs failing after max retries → dead-letter queue (planned)

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| **Fetch latency (P95)** | < 500ms |
| **Playwright latency (P95)** | < 3s |
| **API response (async)** | < 50ms |
| **Throughput** | 100+ jobs/min (with 5 workers) |
| **Concurrent jobs** | 5 per worker |
| **Job retention** | 24 hours (configurable) |

---

## Originality Checklist

✅ Waterfall engine pattern (own implementation)  
✅ Noise cancellation strategy (own filtering rules)  
✅ Modular package structure (original design)  
✅ BullMQ + Redis choice (independent architecture decision)  
❌ No PostgreSQL layer yet (planned)  
❌ No Firecrawl code reuse (verified in codebase)  

---

## References

- [GEMINI.md](GEMINI.md) - Project mandates
- [packages/scraper/src/types.ts](packages/scraper/src/types.ts) - Data schemas
- [apps/api/src/routes/v1.ts](apps/api/src/routes/v1.ts) - Current API impl
- [apps/worker/src/index.ts](apps/worker/src/index.ts) - Worker impl
