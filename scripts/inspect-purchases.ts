import { prisma } from '../src/lib/prisma';

async function main() {
  const purchases = await prisma.purchase.findMany({
    include: {
      user: { select: { email: true, name: true } },
      bundle: { select: { name: true } }
    }
  });
  console.log('Purchases:', purchases.map(p => ({ user: p.user.email, bundle: p.bundle.name, status: p.status, amount: p.amount })));

  const attempts = await prisma.attempt.findMany({
    include: {
      user: { select: { email: true } },
      bundle: { select: { name: true } }
    }
  });
  console.log('Attempts:', attempts.map(a => ({ user: a.user.email, bundle: a.bundle.name, score: a.score, mode: a.mode })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
