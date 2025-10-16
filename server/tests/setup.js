const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

beforeAll(async () => {
  // Setup test database
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup test database
  await prisma.$disconnect();
});

afterEach(async () => {
  // Clean up data after each test
  await prisma.transfer.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
});