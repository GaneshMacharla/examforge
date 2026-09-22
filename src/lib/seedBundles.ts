import { prisma } from '@/lib/prisma';
import { MOCK_BUNDLES } from '@/lib/mockData';

export async function ensureDefaultBundles() {
  try {
    const bundleCount = await prisma.bundle.count();
    if (bundleCount > 0) {
      return;
    }

    console.log('No practice bundles found in DB. Seeding default bundles...');

    for (const mb of MOCK_BUNDLES) {
      // 1. Find or create exam
      let exam = await prisma.exam.findUnique({
        where: { code: mb.exam.code },
      });

      if (!exam) {
        exam = await prisma.exam.create({
          data: {
            name: mb.exam.name,
            code: mb.exam.code,
            icon: mb.exam.icon,
          },
        });
      }

      // 2. Find or create subject
      let subject = await prisma.subject.findFirst({
        where: {
          examId: exam.id,
          name: mb.subjectName,
        },
      });

      if (!subject) {
        subject = await prisma.subject.create({
          data: {
            name: mb.subjectName,
            examId: exam.id,
            description: `${mb.subjectName} for ${exam.name}`,
          },
        });
      }

      // 3. Process questions
      const createdQuestionIds: string[] = [];

      for (const q of mb.questions) {
        // Find or create topic
        let topic = await prisma.topic.findFirst({
          where: {
            subjectId: subject.id,
            name: q.topicName,
          },
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              name: q.topicName,
              subjectId: subject.id,
            },
          });
        }

        // Upsert question
        const question = await prisma.question.upsert({
          where: { id: q.id },
          update: {
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            tags: q.tags.join(', '),
          },
          create: {
            id: q.id,
            examId: exam.id,
            subjectId: subject.id,
            topicId: topic.id,
            questionText: q.questionText,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            tags: q.tags.join(', '),
          },
        });

        createdQuestionIds.push(question.id);
      }

      // 4. Create Bundle
      const bundle = await prisma.bundle.upsert({
        where: { id: mb.id },
        update: {
          name: mb.name,
          description: mb.description,
          examId: exam.id,
          subjectName: mb.subjectName,
          difficulty: mb.difficulty,
          price: mb.price,
          thumbnail: mb.thumbnail,
          status: mb.status || 'PUBLISHED',
        },
        create: {
          id: mb.id,
          name: mb.name,
          description: mb.description,
          examId: exam.id,
          subjectName: mb.subjectName,
          difficulty: mb.difficulty,
          price: mb.price,
          thumbnail: mb.thumbnail,
          status: mb.status || 'PUBLISHED',
        },
      });

      // 5. Link questions to bundle
      for (const qId of createdQuestionIds) {
        await prisma.bundleQuestion.upsert({
          where: {
            bundleId_questionId: {
              bundleId: bundle.id,
              questionId: qId,
            },
          },
          update: {},
          create: {
            bundleId: bundle.id,
            questionId: qId,
          },
        });
      }
    }

    console.log('Successfully seeded default practice bundles into database.');
  } catch (error) {
    console.error('Failed to ensure default bundles:', error);
  }
}
