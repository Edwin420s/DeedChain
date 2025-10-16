const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('User API Endpoints', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        walletAddress: '0xtestuser123456789012345678901234567890',
        name: 'Test User',
        email: 'test@example.com',
        role: 'CITIZEN'
      }
    });

    // Generate auth token
    authToken = jwt.sign(
      { 
        walletAddress: testUser.walletAddress,
        userId: testUser.id,
        role: testUser.role
      },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/users/auth/wallet', () => {
    it('should authenticate user with valid wallet address', async () => {
      const response = await request(app)
        .post('/api/users/auth/wallet')
        .send({
          walletAddress: '0xnewuser123456789012345678901234567890'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.walletAddress).toBe('0xnewuser123456789012345678901234567890');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid wallet address', async () => {
      const response = await request(app)
        .post('/api/users/auth/wallet')
        .send({
          walletAddress: 'invalid-wallet-address'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.walletAddress).toBe(testUser.walletAddress);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test User',
          email: 'updated@example.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Test User');
      expect(response.body.data.user.email).toBe('updated@example.com');
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});