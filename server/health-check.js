const http = require('http');
const logger = require('./src/utils/logger');

const options = {
  host: 'localhost',
  port: process.env.PORT || 5000,
  path: '/health',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'User-Agent': 'DeedChain-Health-Check/1.0.0'
  }
};

const checkHealth = () => {
  const request = http.request(options, (res) => {
    const { statusCode } = res;
    
    if (statusCode === 200) {
      logger.info('Health check: OK');
      process.exit(0);
    } else {
      logger.error(`Health check: FAILED (Status: ${statusCode})`);
      process.exit(1);
    }
  });

  request.on('error', (err) => {
    logger.error(`Health check: ERROR - ${err.message}`);
    process.exit(1);
  });

  request.on('timeout', () => {
    logger.error('Health check: TIMEOUT');
    request.destroy();
    process.exit(1);
  });

  request.end();
};

// Run health check
checkHealth();