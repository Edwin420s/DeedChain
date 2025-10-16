const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('Property API Endpoints', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        walletAddress: '0xpropertytest123456789012345678901234567890',
        name: 'Property Test User',
        email: 'propertytest@example.com',
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
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/properties/register', () => {
    it('should register a new property with valid data', async () => {
      const propertyData = {
        title: 'Test Property',
        description: 'This is a test property description',
        location: 'Test Location, Kenya',
        coordinates: '-1.2921,36.8219',
        size: 1000,
        documents: [
          {
            name: 'title_deed.pdf',
            type: 'application/pdf',
            size: 1024000
          }
        ]
      };

      const response = await request(app)
        .post('/api/properties/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.property.title).toBe(propertyData.title);
      expect(response.body.data.property.status).toBe('PENDING');
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/properties/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Incomplete Property'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/properties', () => {
    it('should return list of properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.properties)).toBe(true);
    });

    it('should filter properties by status', async () => {
      const response = await request(app)
        .get('/api/properties?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});