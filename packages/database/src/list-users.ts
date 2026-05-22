import { prisma } from './index';

async function listUsers() {
  const users = await prisma.user.findMany();
  console.log('--- REGISTERED USERS ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.fullName} | Role: ${u.role} | Verified: ${u.isVerified} | Code: ${u.verificationCode}`);
  });
}

listUsers().finally(() => prisma.$disconnect());
