"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJobResult = saveJobResult;
exports.getJobResult = getJobResult;
const queue_js_1 = require("./queue.js");
const RESULT_EXPIRY = 60 * 60 * 24; // 24 hours
async function saveJobResult(jobId, result) {
    await queue_js_1.redisConnection.setex(`result:${jobId}`, RESULT_EXPIRY, JSON.stringify(result));
}
async function getJobResult(jobId) {
    const data = await queue_js_1.redisConnection.get(`result:${jobId}`);
    return data ? JSON.parse(data) : null;
}
