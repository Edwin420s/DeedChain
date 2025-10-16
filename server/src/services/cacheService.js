const redis = require('redis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.connect();
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
    }
  }

  async set(key, value, expiration = 3600) { // Default 1 hour
    if (!this.client) return null;
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.set(key, serializedValue, {
        EX: expiration
      });
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  async get(key) {
    if (!this.client) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async del(key) {
    if (!this.client) return null;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis delete error:', error);
      return false;
    }
  }

  async exists(key) {
    if (!this.client) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  async increment(key) {
    if (!this.client) return null;
    
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis increment error:', error);
      return null;
    }
  }

  async expire(key, seconds) {
    if (!this.client) return null;
    
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }
  }

  async getKeys(pattern) {
    if (!this.client) return [];
    
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis keys error:', error);
      return [];
    }
  }

  async flushAll() {
    if (!this.client) return null;
    
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Redis flushAll error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
    }
  }
}

module.exports = new CacheService();