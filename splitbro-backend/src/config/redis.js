import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        // Stop reconnecting and disable logs pollution
        return false;
      }
      return 1000; // retry after 1 second
    }
  }
});

redisClient.on('error', (err) => {
  // Only log if it's not a connection closed/refused error after we gave up, or log it once.
  console.error('Redis Client Error:', err.message || err);
});


export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Redis Connected');
    }
  } catch (err) {
    console.error('Redis Connection Error:', err);
  }
};

export default redisClient;
