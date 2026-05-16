# Implementation Gaps - Quick Start Templates

This file provides code templates for the **Priority 1** blocking issues identified in [VALIDATION_REPORT.md](VALIDATION_REPORT.md).

---

## 1. Centralized Configuration (config.ts)

**Location:** `apps/api/src/config.ts`  
**Purpose:** Validate all env vars at startup, fail fast if missing

```typescript
import { z } from 'zod';

const configSchema = z.object({
  // API
  API_PORT: z.coerce.number().int().default(3000),
  API_HOST: z.string().default('0.0.0.0'),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // Worker
  WORKER_CONCURRENCY: z.coerce.number().int().default(5),
  WORKER_TIMEOUT_MS: z.coerce.number().int().default(60000),
  
  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse(process.env);

// Usage in apps/api/src/index.ts:
// import { config } from './config';
// app.listen(config.API_PORT, config.API_HOST);
```

**File:** `.env.example`
```env
# API
API_PORT=3000
API_HOST=0.0.0.0

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Worker
WORKER_CONCURRENCY=5
WORKER_TIMEOUT_MS=60000

# Logging
LOG_LEVEL=info

# Environment
NODE_ENV=development
```

---

## 2. Request Validation Middleware

**Location:** `apps/api/src/middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request',
          errors: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Usage in routes/v1.ts:
// router.post('/scrape', validateRequest(ScrapeOptionsSchema), (req, res) => { ... });
```

---

## 3. Error Handler Middleware

**Location:** `apps/api/src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const correlationId = req.headers['x-correlation-id'] || 'unknown';

  logger.error({
    level: 'error',
    message,
    code,
    statusCode,
    correlationId,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json({
    code,
    message,
    correlationId,
    timestamp: new Date().toISOString(),
  });
};

// Usage in apps/api/src/index.ts:
// app.use(errorHandler); // Must be last middleware
```

---

## 4. Request Logging Middleware (with Correlation ID)

**Location:** `apps/api/src/middleware/requestLogger.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  const startTime = Date.now();

  // Attach to request for use in handlers
  req.headers['x-correlation-id'] = correlationId;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      level: 'info',
      message: 'HTTP Request',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      correlationId,
    });
  });

  next();
};

// Usage in apps/api/src/index.ts:
// app.use(requestLogger);
```

---

## 5. Updated API Routes with Middleware

**Location:** `apps/api/src/routes/v1.ts` (UPDATE)

```typescript
import { Router } from 'express';
import { ScrapeOptionsSchema } from '@crawwl/scraper';
import { scrapeQueue, getJobResult } from '@crawwl/core';
import { validateRequest } from '../middleware/validate';
import { v7 as uuidv7 } from 'uuid';
import { logger } from '../lib/logger';

const router = Router();

// POST /v1/scrape - Create scrape job
router.post(
  '/scrape',
  validateRequest(ScrapeOptionsSchema),
  async (req, res, next) => {
    try {
      const jobId = uuidv7();
      const options = req.body;

      await scrapeQueue.add('scrape', options, {
        jobId,
        priority: 0,
      });

      res.status(202).json({
        jobId,
        status: 'pending',
        url: options.url,
        createdAt: new Date().toISOString(),
      });

      logger.info({
        message: 'Scrape job created',
        jobId,
        url: options.url,
        correlationId: req.headers['x-correlation-id'],
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /v1/jobs/:jobId - Check job status
router.get('/jobs/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await getJobResult(jobId);

    if (!result) {
      return res.status(404).json({
        code: 'JOB_NOT_FOUND',
        message: `Job ${jobId} not found or has expired`,
        correlationId: req.headers['x-correlation-id'],
      });
    }

    res.status(200).json({
      jobId,
      status: result.success ? 'completed' : 'failed',
      result,
    });
  } catch (error) {
    next(error);
  }
});

// POST /v1/crawl - Create crawl job (IMPLEMENT THIS)
router.post(
  '/crawl',
  validateRequest(CrawlOptionsSchema), // Need to create this schema
  async (req, res, next) => {
    try {
      const jobId = uuidv7();
      const options = req.body;

      // TODO: Implement crawl queue logic
      // await crawlQueue.add('crawl', options, { jobId });

      res.status(202).json({
        jobId,
        status: 'pending',
        urls: options.urls,
        createdAt: new Date().toISOString(),
      });

      logger.info({
        message: 'Crawl job created',
        jobId,
        urlCount: options.urls.length,
        correlationId: req.headers['x-correlation-id'],
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

---

## 6. Updated API Server (index.ts)

**Location:** `apps/api/src/index.ts` (UPDATE)

```typescript
import express from 'express';
import { config } from './config';
import { logger } from './lib/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import v1Router from './routes/v1';

const app = express();

// Middleware
app.use(express.json());
app.use(requestLogger); // Add request logging with correlation ID

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'crawwl-api' });
});

app.use('/v1', v1Router);

// Error handling (must be last)
app.use(errorHandler);

// Start server
const PORT = config.API_PORT;
const HOST = config.API_HOST;

app.listen(PORT, HOST, () => {
  logger.info({
    message: 'Crawwl API server started',
    host: HOST,
    port: PORT,
    environment: config.NODE_ENV,
  });
});
```

---

## 7. Worker Graceful Shutdown

**Location:** `apps/worker/src/gracefulShutdown.ts` (NEW)

```typescript
import { logger } from '@crawwl/core'; // Assuming logger exported
import { Worker } from 'bullmq';

export function setupGracefulShutdown(worker: Worker) {
  const signals = ['SIGTERM', 'SIGINT'];

  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.info({
        message: `Received ${signal}, gracefully shutting down...`,
      });

      try {
        // Wait for currently processing jobs to complete (max 30s)
        await worker.close(true);
        logger.info({
          message: 'Worker closed gracefully',
        });

        process.exit(0);
      } catch (error) {
        logger.error({
          message: 'Error during graceful shutdown',
          error: (error as Error).message,
        });
        process.exit(1);
      }
    });
  });
}

// Usage in apps/worker/src/index.ts:
// import { setupGracefulShutdown } from './gracefulShutdown';
// const worker = new Worker('scrape-jobs', ..., {});
// setupGracefulShutdown(worker);
```

---

## 8. Dead-Letter Queue Handler

**Location:** `apps/worker/src/deadLetterQueue.ts` (NEW)

```typescript
import { Queue, Worker } from 'bullmq';
import { redisConnection } from '@crawwl/core';
import { logger } from '@crawwl/core';

const DLQ_NAME = 'scrape-jobs-dlq';

export async function createDLQ() {
  const dlq = new Queue(DLQ_NAME, { connection: redisConnection });
  return dlq;
}

export async function setupDLQWorker() {
  const dlq = new Queue(DLQ_NAME, { connection: redisConnection });

  const worker = new Worker(
    DLQ_NAME,
    async job => {
      logger.warn({
        message: 'Processing dead-lettered job',
        jobId: job.id,
        attempts: job.attemptsMade,
        data: job.data,
        failedReason: job.failedReason,
      });

      // Here you could:
      // - Send alert to ops
      // - Log to database for manual inspection
      // - Trigger retry with backoff
    },
    { connection: redisConnection, concurrency: 1 }
  );

  return worker;
}

// Usage in apps/worker/src/index.ts:
// On job failure, move to DLQ:
// worker.on('failed', async (job, err) => {
//   const dlq = await createDLQ();
//   await dlq.add('failed-job', job.data, { jobId: job.id });
// });
```

---

## 9. Proxy Implementation (Fetch Engine Update)

**Location:** `packages/scraper/src/engines/fetch.ts` (UPDATE)

```typescript
import axios, { AxiosInstance } from 'axios';
import { ScrapeOptions, ScrapeResult } from '../types';
import { HttpProxyAgent, HttpsProxyAgent } from 'http-proxy-agent';

export class FetchEngine implements IScraperEngine {
  name = 'fetch';
  private proxyUrl?: string;

  constructor(proxyUrl?: string) {
    this.proxyUrl = proxyUrl;
  }

  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    try {
      const client = this.createAxiosClient(options);

      const response = await client.get(options.url, {
        timeout: options.timeout || 30000,
        validateStatus: () => true, // Don't throw on non-2xx
      });

      return {
        success: response.status < 400,
        url: options.url,
        statusCode: response.status,
        html: response.data,
        metadata: {
          engine: 'fetch',
          contentType: response.headers['content-type'],
        },
      };
    } catch (error) {
      return {
        success: false,
        url: options.url,
        statusCode: 0,
        error: (error as Error).message,
        metadata: { engine: 'fetch' },
      };
    }
  }

  private createAxiosClient(options: ScrapeOptions): AxiosInstance {
    const headers: Record<string, string> = {
      'User-Agent': options.mobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    };

    const axiosOptions: any = {
      headers,
    };

    // Apply proxy if specified
    if (options.proxy === 'auto' && this.proxyUrl) {
      const agent = this.proxyUrl.startsWith('https')
        ? new HttpsProxyAgent(this.proxyUrl)
        : new HttpProxyAgent(this.proxyUrl);
      axiosOptions.httpAgent = agent;
      axiosOptions.httpsAgent = agent;
    }

    // Skip TLS verification if requested
    if (options.skipTlsVerification) {
      axiosOptions.httpsAgent = new (require('https').Agent)({
        rejectUnauthorized: false,
      });
    }

    return axios.create(axiosOptions);
  }
}
```

---

## Implementation Checklist

Quick copy-paste to apply all Priority 1 fixes:

```bash
# 1. Create config.ts
cat > apps/api/src/config.ts << 'EOF'
# [Use template from Section 1 above]
EOF

# 2. Create middleware files
cat > apps/api/src/middleware/validate.ts << 'EOF'
# [Use template from Section 2]
EOF

cat > apps/api/src/middleware/errorHandler.ts << 'EOF'
# [Use template from Section 3]
EOF

cat > apps/api/src/middleware/requestLogger.ts << 'EOF'
# [Use template from Section 4]
EOF

# 3. Update routes & index
# [Manually apply changes from Sections 5-6]

# 4. Add worker shutdown
cat > apps/worker/src/gracefulShutdown.ts << 'EOF'
# [Use template from Section 7]
EOF

# 5. Test
pnpm build
pnpm test

# 6. Deploy
git add .
git commit -m "feat: add request validation, error handling, config management"
git push
```

---

## Testing

After implementing fixes, run:

```bash
# Lint & type check
pnpm lint
pnpm type-check

# Unit tests (if applicable)
pnpm test

# Integration test: POST /scrape
curl -X POST http://localhost:3000/v1/scrape \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test-123" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"],
    "timeout": 10000
  }'

# Expected response (202):
# {
#   "jobId": "...",
#   "status": "pending",
#   "url": "https://example.com",
#   "createdAt": "2026-05-17T..."
# }
```

---

## See Also

- [SPECIFICATION.md](SPECIFICATION.md) - Full project spec
- [VALIDATION_REPORT.md](VALIDATION_REPORT.md) - Detailed validation findings
- [GEMINI.md](GEMINI.md) - Project mandates
