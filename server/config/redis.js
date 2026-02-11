const Redis = require('ioredis');
const colors = require('colors');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
    retryStrategy: (times) => {
        // Retry connection every 2 seconds, max 3 times
        if (times > 3) {
            console.error(colors.red('Redis connection failed. Running without cache.'));
            return null;
        }
        return 2000;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

redis.on('connect', () => {
    console.log(colors.cyan.bold('Redis Connected'));
});

redis.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        // Suppress connection refused errors if Redis is down
        // consoel.warn('Redis unavailable');
    } else {
        console.error(colors.red(`Redis Error: ${err.message}`));
    }
});

module.exports = redis;
