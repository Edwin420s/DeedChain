const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('User API', () => {
  const testWallet = '0x742E4C3B1a5c1b6F7e82C2C6F2e9a4D6B2e8F1a9';

  describe('POST /api/users/auth/wallet', () => {
    it('should authenticate user with wallet', async () => {
      const response = await request(app)
        .post('/api/users/auth/wallet')
        .send({
          walletAddress: testWallet
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.walletAddress).toBe(testWallet.toLowerCase());
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/users/auth/wallet')
        .send({
          walletAddress: 'invalid-wallet'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});