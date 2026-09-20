import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- CLEANING EVOKEVOICE TABLES FROM NEON DB ---');

  const evokeVoiceTables = [
    'orders',
    'creators',
    'admin_users',
    'phone_otps',
    'waitlist',
    'users', // lowercase 'users' is EvokeVoice; ExamForge is "User"
  ];

  for (const table of evokeVoiceTables) {
    try {
      console.log(`Dropping table "${table}"...`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
      console.log(`✓ Dropped table "${table}"`);
    } catch (err: any) {
      console.error(`Error dropping table "${table}":`, err.message);
    }
  }

  console.log('\n--- VERIFYING REMAINING TABLES IN PUBLIC SCHEMA ---');
  const tables: any[] = await prisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );

  console.log('Remaining tables:');
  for (const t of tables) {
    const count: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${t.table_name}";`).catch(() => [{ count: 'error' }]);
    console.log(`- ${t.table_name}: ${count[0]?.count} rows`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
