import IORedis from 'ioredis';

async function check() {
  const redis = new IORedis("redis://localhost:6379");
  const keys = await redis.keys("result:*");
  console.log(`Found ${keys.length} results:`);
  for (const key of keys) {
    const data = await redis.get(key);
    const parsed = JSON.parse(data);
    console.log(`- ${key}: ${parsed.success ? 'Success' : 'Failed'} (${parsed.statusCode}) - Markdown Length: ${parsed.markdown?.length || 0}`);
  }
  process.exit(0);
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
