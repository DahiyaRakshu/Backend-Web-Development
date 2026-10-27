'use strict';

const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,
  // Fail cache operations promptly during an outage, allowing DB fallback.
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 1000,
});
redis.on('error', (err) => console.error('[cache] connection error:', err.message));

async function cacheGet(key) {
  try {
    if (redis.status === 'wait') await redis.connect();
    const value = await redis.get(key);
    return value === null ? null : JSON.parse(value);
  } catch (err) {
    console.error('[cache] get error:', err.message);
    return null;
  }
}

async function cacheSet(key, data, ttlSeconds) {
  try {
    if (redis.status === 'wait') await redis.connect();
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[cache] set error:', err.message);
  }
}

async function cacheDel(key) {
  try {
    if (redis.status === 'wait') await redis.connect();
    await redis.del(key);
  } catch (err) {
    console.error('[cache] delete error:', err.message);
  }
}

module.exports = { cacheGet, cacheSet, cacheDel, redis };
