import { redisConnection } from './queue.js';
const RESULT_EXPIRY = 60 * 60 * 24; // 24 hours
export async function saveJobResult(jobId, result) {
    await redisConnection.setex(`result:${jobId}`, RESULT_EXPIRY, JSON.stringify(result));
}
export async function getJobResult(jobId) {
    const data = await redisConnection.get(`result:${jobId}`);
    return data ? JSON.parse(data) : null;
}
