import { prisma } from '../src/lib/prisma';

async function main() {
  const targetEmail = process.argv[2];

  if (!targetEmail) {
    console.error('Please specify an email: npx tsx scripts/set-admin.ts <email>');
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email: targetEmail.toLowerCase().trim() },
    data: { role: 'ADMIN' },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log(`Successfully promoted ${updated.email} (${updated.name}) to role: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error('Error updating user:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
