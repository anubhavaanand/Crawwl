"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapeOptionsSchema = exports.ScrapeFormatSchema = void 0;
const zod_1 = require("zod");
exports.ScrapeFormatSchema = zod_1.z.enum(['markdown', 'html', 'rawHtml', 'json', 'screenshot']);
exports.ScrapeOptionsSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
    formats: zod_1.z.array(exports.ScrapeFormatSchema).default(['markdown']),
    timeout: zod_1.z.number().optional().default(30000),
    waitFor: zod_1.z.number().optional().default(0),
    mobile: zod_1.z.boolean().optional().default(false),
    skipTlsVerification: zod_1.z.boolean().optional().default(true),
    proxy: zod_1.z.enum(['none', 'auto', 'stealth']).optional().default('auto'),
});
