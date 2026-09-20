import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Adding examId column to Question table safely via SQL...');

  // 1. Add column if it doesn't already exist
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Question" 
    ADD COLUMN IF NOT EXISTS "examId" TEXT;
  `);

  // 2. Add foreign key constraint if it doesn't already exist
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Question_examId_fkey'
      ) THEN
        ALTER TABLE "Question"
        ADD CONSTRAINT "Question_examId_fkey"
        FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log('Successfully added examId column and foreign key constraint to Question table!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
