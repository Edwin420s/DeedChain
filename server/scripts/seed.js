const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { walletAddress: process.env.ADMIN_WALLET_ADDRESS || '0xAdminWalletAddress' },
    update: {},
    create: {
      walletAddress: (process.env.ADMIN_WALLET_ADDRESS || '0xAdminWalletAddress').toLowerCase(),
      name: 'DeedChain Admin',
      email: 'admin@deedchain.com',
      role: 'ADMIN'
    }
  });

  // Create sample verifier
  const verifierUser = await prisma.user.upsert({
    where: { walletAddress: '0xVerifierWalletAddress123' },
    update: {},
    create: {
      walletAddress: '0xverifierwalletaddress123',
      name: 'Land Verification Officer',
      email: 'verifier@deedchain.com',
      role: 'VERIFIER'
    }
  });

  // Create sample citizen user
  const citizenUser = await prisma.user.upsert({
    where: { walletAddress: '0xCitizenWalletAddress456' },
    update: {},
    create: {
      walletAddress: '0xcitizenwalletaddress456',
      name: 'John Property Owner',
      email: 'john@example.com',
      role: 'CITIZEN'
    }
  });

  // Create sample properties
  const sampleProperties = [
    {
      title: 'Residential Plot - Karen',
      description: 'Beautiful residential plot in Karen area with clear title deed',
      location: 'Karen, Nairobi, Kenya',
      coordinates: '-1.3192,36.7117',
      size: 1000,
      ipfsHash: 'QmSampleHash1',
      ownerId: citizenUser.id,
      status: 'VERIFIED',
      tokenId: 1
    },
    {
      title: 'Commercial Land - Westlands',
      description: 'Prime commercial land suitable for office development',
      location: 'Westlands, Nairobi, Kenya',
      coordinates: '-1.2659,36.8060',
      size: 500,
      ipfsHash: 'QmSampleHash2',
      ownerId: citizenUser.id,
      status: 'PENDING'
    },
    {
      title: 'Agricultural Land - Kiambu',
      description: 'Fertile agricultural land with water access',
      location: 'Kiambu County, Kenya',
      coordinates: '-1.1667,36.8333',
      size: 5000,
      ipfsHash: 'QmSampleHash3',
      ownerId: adminUser.id,
      status: 'VERIFIED',
      tokenId: 2
    }
  ];

  for (const propertyData of sampleProperties) {
    await prisma.property.upsert({
      where: { title: propertyData.title },
      update: {},
      create: propertyData
    });
  }

  // Create sample verification
  const verifiedProperty = await prisma.property.findFirst({
    where: { status: 'VERIFIED' }
  });

  if (verifiedProperty) {
    await prisma.verification.upsert({
      where: {
        propertyId_verifierId: {
          propertyId: verifiedProperty.id,
          verifierId: verifierUser.id
        }
      },
      update: {},
      create: {
        propertyId: verifiedProperty.id,
        verifierId: verifierUser.id,
        approved: true,
        comments: 'All documents verified and property boundaries confirmed.'
      }
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin user:', adminUser.walletAddress);
  console.log('Verifier user:', verifierUser.walletAddress);
  console.log('Citizen user:', citizenUser.walletAddress);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });