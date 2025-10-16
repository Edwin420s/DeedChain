const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'colorless',
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');
      return true;
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      await this.prisma.$disconnect();
      logger.info('✅ Database disconnected successfully');
    } catch (error) {
      logger.error('❌ Database disconnection failed:', error);
    }
  }

  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Transaction helper
  async transaction(callback) {
    return await this.prisma.$transaction(callback);
  }

  // Query raw SQL (use with caution)
  async rawQuery(query, params = []) {
    return await this.prisma.$queryRawUnsafe(query, ...params);
  }
}

// Create singleton instance
const database = new Database();

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing database connections...');
  await database.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // For nodemon

module.exports = {
  prisma: database.prisma,
  connect: database.connect.bind(database),
  disconnect: database.disconnect.bind(database),
  healthCheck: database.healthCheck.bind(database),
  transaction: database.transaction.bind(database),
  rawQuery: database.rawQuery.bind(database)
};