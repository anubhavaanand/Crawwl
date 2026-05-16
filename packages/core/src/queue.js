"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlQueue = exports.scrapeQueue = exports.CRAWL_QUEUE_NAME = exports.SCRAPE_QUEUE_NAME = exports.redisConnection = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redisConnection = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
});
exports.SCRAPE_QUEUE_NAME = 'scrape-jobs';
exports.CRAWL_QUEUE_NAME = 'crawl-jobs';
exports.scrapeQueue = new bullmq_1.Queue(exports.SCRAPE_QUEUE_NAME, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 1000,
    },
});
exports.crawlQueue = new bullmq_1.Queue(exports.CRAWL_QUEUE_NAME, {
    connection: exports.redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: 1000,
    },
});
