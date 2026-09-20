import { PrismaClient } from '@prisma/client';

async function main() {
  const neonPrisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://neondb_owner:npg_2NcJMvaVA1ex@ep-long-snow-au8clo30-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
      }
    }
  });

  const supabasePrisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres.iwcbortagniaarabonex:MaheshGodikey@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30"
      }
    }
  });

  const neonQuestions = await neonPrisma.question.count().catch((e) => e.message);
  const neonBundles = await neonPrisma.bundle.count().catch((e) => e.message);
  const supabaseQuestions = await supabasePrisma.question.count().catch((e) => e.message);
  const supabaseBundles = await supabasePrisma.bundle.count().catch((e) => e.message);

  console.log('--- DATABASE COMPARISON ---');
  console.log('Neon Questions:', neonQuestions, 'Neon Bundles:', neonBundles);
  console.log('Supabase Questions:', supabaseQuestions, 'Supabase Bundles:', supabaseBundles);

  await neonPrisma.$disconnect();
  await supabasePrisma.$disconnect();
}

main().catch(console.error);
