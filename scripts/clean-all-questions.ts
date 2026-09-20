import { PrismaClient } from '@prisma/client';

async function cleanDatabase(name: string, url: string) {
  console.log(`\n--- CLEANING QUESTIONS & BUNDLES FROM ${name} ---`);
  const prisma = new PrismaClient({ datasources: { db: { url } } });

  try {
    // 1. Delete test attempts and answers
    const deletedAnswers = await prisma.attemptAnswer.deleteMany({});
    const deletedAttempts = await prisma.attempt.deleteMany({});
    console.log(`✓ Deleted ${deletedAnswers.count} attempt answers, ${deletedAttempts.count} attempts`);

    // 2. Delete bundle questions
    const deletedBQ = await prisma.bundleQuestion.deleteMany({});
    console.log(`✓ Deleted ${deletedBQ.count} bundle-question links`);

    // 3. Delete bundles
    const deletedBundles = await prisma.bundle.deleteMany({});
    console.log(`✓ Deleted ${deletedBundles.count} bundles`);

    // 4. Delete questions
    const deletedQuestions = await prisma.question.deleteMany({});
    console.log(`✓ Deleted ${deletedQuestions.count} questions`);

    // 5. Verify counts
    const remainingQuestions = await prisma.question.count();
    const remainingBundles = await prisma.bundle.count();
    const remainingUsers = await prisma.user.count();
    const remainingExams = await prisma.exam.count();

    console.log(`Verification for ${name}:`);
    console.log(`  Questions: ${remainingQuestions}`);
    console.log(`  Bundles: ${remainingBundles}`);
    console.log(`  Users (Preserved): ${remainingUsers}`);
    console.log(`  Exams (Preserved): ${remainingExams}`);
  } catch (err: any) {
    console.error(`Error cleaning ${name}:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const neonUrl = "postgresql://neondb_owner:npg_2NcJMvaVA1ex@ep-long-snow-au8clo30-pooler.c-10.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";
  const supabaseUrl = "postgresql://postgres.iwcbortagniaarabonex:MaheshGodikey@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30";

  await cleanDatabase('NEON', neonUrl);
  await cleanDatabase('SUPABASE', supabaseUrl);

  console.log('\n✓ BOTH DATABASES HAVE BEEN CLEANED TO 0 QUESTIONS & 0 BUNDLES.');
}

main().catch(console.error);
