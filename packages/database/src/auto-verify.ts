import { prisma } from './index';

async function autoVerify() {
  const unverified = await prisma.user.findMany({
    where: { isVerified: false }
  });

  if (unverified.length === 0) {
    console.log('No unverified users found.');
    return;
  }

  for (const user of unverified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });
    console.log(`Successfully verified user: ${user.email}`);
  }
}

autoVerify().finally(() => prisma.$disconnect());
