const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');
    logger.info('Starting database seed...');

    // Create admin user
    const adminWallet = process.env.ADMIN_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const adminUser = await prisma.user.upsert({
      where: { walletAddress: adminWallet.toLowerCase() },
      update: {
        name: 'DeedChain Admin',
        email: 'admin@deedchain.com',
        role: 'ADMIN'
      },
      create: {
        walletAddress: adminWallet.toLowerCase(),
        name: 'DeedChain Admin',
        email: 'admin@deedchain.com',
        role: 'ADMIN'
      }
    });

    // Create sample verifiers
    const verifier1 = await prisma.user.upsert({
      where: { walletAddress: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8' },
      update: {},
      create: {
        walletAddress: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        name: 'Land Verification Officer 1',
        email: 'verifier1@deedchain.com',
        role: 'VERIFIER'
      }
    });

    const verifier2 = await prisma.user.upsert({
      where: { walletAddress: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc' },
      update: {},
      create: {
        walletAddress: '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc',
        name: 'Land Verification Officer 2',
        email: 'verifier2@deedchain.com',
        role: 'VERIFIER'
      }
    });

    // Create sample citizen users
    const citizen1 = await prisma.user.upsert({
      where: { walletAddress: '0x90f79bf6eb2c4f870365e785982e1f101e93b906' },
      update: {},
      create: {
        walletAddress: '0x90f79bf6eb2c4f870365e785982e1f101e93b906',
        name: 'John Property Owner',
        email: 'john@example.com',
        role: 'CITIZEN'
      }
    });

    const citizen2 = await prisma.user.upsert({
      where: { walletAddress: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65' },
      update: {},
      create: {
        walletAddress: '0x15d34aaf54267db7d7c367839aaf71a00a2c6a65',
        name: 'Sarah Land Investor',
        email: 'sarah@example.com',
        role: 'CITIZEN'
      }
    });

    // Create sample properties
    const sampleProperties = [
      {
        title: 'Residential Plot - Karen',
        description: 'Beautiful residential plot in Karen area with clear title deed. Perfect for family home construction.',
        location: 'Karen, Nairobi, Kenya',
        coordinates: '-1.3192,36.7117',
        size: 1000,
        ipfsHash: 'QmSampleHash1KarenResidential',
        ownerId: citizen1.id,
        status: 'VERIFIED',
        tokenId: 1001
      },
      {
        title: 'Commercial Land - Westlands',
        description: 'Prime commercial land suitable for office development, located in the heart of Westlands business district.',
        location: 'Westlands, Nairobi, Kenya',
        coordinates: '-1.2659,36.8060',
        size: 500,
        ipfsHash: 'QmSampleHash2WestlandsCommercial',
        ownerId: citizen1.id,
        status: 'PENDING'
      },
      {
        title: 'Agricultural Land - Kiambu',
        description: 'Fertile agricultural land with water access, ideal for farming and agricultural projects.',
        location: 'Kiambu County, Kenya',
        coordinates: '-1.1667,36.8333',
        size: 5000,
        ipfsHash: 'QmSampleHash3KiambuAgricultural',
        ownerId: citizen2.id,
        status: 'VERIFIED',
        tokenId: 1002
      },
      {
        title: 'Beach Plot - Diani',
        description: 'Stunning beachfront property with ocean views, perfect for vacation home or resort development.',
        location: 'Diani Beach, Kwale County, Kenya',
        coordinates: '-4.3000,39.5833',
        size: 800,
        ipfsHash: 'QmSampleHash4DianiBeach',
        ownerId: adminUser.id,
        status: 'PENDING'
      }
    ];

    for (const propertyData of sampleProperties) {
      await prisma.property.upsert({
        where: { title: propertyData.title },
        update: propertyData,
        create: propertyData
      });
    }

    // Create sample verifications
    const verifiedProperties = await prisma.property.findMany({
      where: { status: 'VERIFIED' }
    });

    for (const property of verifiedProperties) {
      await prisma.verification.upsert({
        where: {
          propertyId_verifierId: {
            propertyId: property.id,
            verifierId: verifier1.id
          }
        },
        update: {
          approved: true,
          comments: 'All documents verified and property boundaries confirmed. Title deed is authentic.'
        },
        create: {
          propertyId: property.id,
          verifierId: verifier1.id,
          approved: true,
          comments: 'All documents verified and property boundaries confirmed. Title deed is authentic.'
        }
      });
    }

    // Create sample transfers
    const transferProperty = await prisma.property.findFirst({
      where: { 
        status: 'VERIFIED',
        ownerId: citizen1.id 
      }
    });

    if (transferProperty) {
      await prisma.transfer.upsert({
        where: {
          id: 'sample-transfer-1'
        },
        update: {
          propertyId: transferProperty.id,
          fromUserId: citizen1.id,
          toUserId: citizen2.id,
          status: 'COMPLETED',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          completedAt: new Date('2024-01-15')
        },
        create: {
          id: 'sample-transfer-1',
          propertyId: transferProperty.id,
          fromUserId: citizen1.id,
          toUserId: citizen2.id,
          status: 'COMPLETED',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          completedAt: new Date('2024-01-15')
        }
      });
    }

    // Create pending transfer
    const pendingTransferProperty = await prisma.property.findFirst({
      where: { 
        status: 'VERIFIED',
        ownerId: citizen2.id 
      }
    });

    if (pendingTransferProperty) {
      await prisma.transfer.upsert({
        where: {
          id: 'sample-transfer-2'
        },
        update: {
          propertyId: pendingTransferProperty.id,
          fromUserId: citizen2.id,
          toUserId: citizen1.id,
          status: 'PENDING'
        },
        create: {
          id: 'sample-transfer-2',
          propertyId: pendingTransferProperty.id,
          fromUserId: citizen2.id,
          toUserId: citizen1.id,
          status: 'PENDING'
        }
      });
    }

    console.log('Database seeded successfully!');
    console.log('=== Created Users ===');
    console.log(`Admin: ${adminUser.walletAddress} (${adminUser.name})`);
    console.log(`Verifier 1: ${verifier1.walletAddress} (${verifier1.name})`);
    console.log(`Verifier 2: ${verifier2.walletAddress} (${verifier2.name})`);
    console.log(`Citizen 1: ${citizen1.walletAddress} (${citizen1.name})`);
    console.log(`Citizen 2: ${citizen2.walletAddress} (${citizen2.name})`);
    
    const propertyCount = await prisma.property.count();
    const verificationCount = await prisma.verification.count();
    const transferCount = await prisma.transfer.count();
    
    console.log('=== Created Data ===');
    console.log(`Properties: ${propertyCount}`);
    console.log(`Verifications: ${verificationCount}`);
    console.log(`Transfers: ${transferCount}`);

    logger.info('Database seeding completed successfully');

  } catch (error) {
    console.error('Seeding error:', error);
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });