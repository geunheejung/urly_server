import dotenv from 'dotenv';
import * as redis from 'redis';

dotenv.config();

// const url = `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`;
const redisClient = redis.createClient({
  // url,
  legacyMode: true,
});

redisClient.on('connect', () => {
  console.info(`[Redis connected]`);
});
redisClient.on('error', (err) => {
  console.error(`[Redis Client Error] ${err}`);
});

redisClient.connect().then();
const redisCli = redisClient.v4;

export default redisCli;
