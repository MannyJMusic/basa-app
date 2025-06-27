import { prisma } from '../src/lib/db'

async function main() {
  const guests = await prisma.user.findMany({
    where: {
      role: 'GUEST',
      member: null
    }
  });

  for (const user of guests) {
    await prisma.member.create({
      data: {
        userId: user.id,
        businessName: 'Guest',
        membershipTier: 'BASIC',
        membershipStatus: 'ACTIVE',
        joinedAt: new Date(),
      }
    });
    console.log(`Created member record for guest user: ${user.email}`);
  }
}

main().then(() => {
  console.log('Backfill complete!');
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
}); 