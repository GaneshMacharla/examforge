import { prisma } from '../src/lib/prisma';

async function main() {
  const tables: any[] = await prisma.$queryRawUnsafe(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log('All tables in public schema:');
  for (const t of tables) {
    const count = (await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${t.table_name}";`).catch(() => [{ count: 'error' }])) as any[];
    console.log(`- ${t.table_name}: ${count[0]?.count} rows`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
