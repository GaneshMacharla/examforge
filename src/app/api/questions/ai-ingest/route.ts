import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to validate API Key from request headers
function validateAuth(request: Request): boolean {
  const secret = process.env.AI_INGEST_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7).trim()
    : null;
  const apiKey = request.headers.get('x-api-key')?.trim();

  return (bearerToken === secret) || (apiKey === secret);
}

// Normalize correct answer to 'A', 'B', 'C', or 'D'
function normalizeCorrectAnswer(val: any): string | null {
  if (!val) return null;
  const clean = String(val).trim().toUpperCase();
  if (['A', 'B', 'C', 'D'].includes(clean)) return clean;
  if (clean === '1' || clean === 'OPTION A' || clean === 'OPTIONA') return 'A';
  if (clean === '2' || clean === 'OPTION B' || clean === 'OPTIONB') return 'B';
  if (clean === '3' || clean === 'OPTION C' || clean === 'OPTIONC') return 'C';
  if (clean === '4' || clean === 'OPTION D' || clean === 'OPTIOND') return 'D';
  return null;
}

// Normalize difficulty
function normalizeDifficulty(val: any): string {
  if (!val) return 'Medium';
  const clean = String(val).trim().toLowerCase();
  if (clean === 'easy') return 'Easy';
  if (clean === 'hard') return 'Hard';
  return 'Medium';
}

// GET: Health check & curriculum discovery for external agents
export async function GET(request: Request) {
  if (!validateAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Provide valid x-api-key or Authorization Bearer header' },
      { status: 401 }
    );
  }

  try {
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        subjects: {
          select: {
            id: true,
            name: true,
            topics: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      status: 'ready',
      message: 'AI Ingestion endpoint is active. POST questions to this URL.',
      availableCurriculum: exams,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to query database', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Store AI-generated questions
export async function POST(request: Request) {
  // 1. Verify Secret Key
  if (!validateAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Provide valid x-api-key or Authorization Bearer header' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    // Support multiple payload shapes:
    // Shape 1: Direct Array [ {...}, {...} ]
    // Shape 2: { examCode, subjectName, topicName, questions: [ {...}, {...} ] }
    // Shape 3: Single Question Object { examCode, subjectName, topicName, questionText, ... }
    let rawQuestions: any[] = [];
    let defaultExam = body.examCode || body.examName || body.examId || null;
    let defaultSubject = body.subjectName || body.subjectId || null;
    let defaultTopic = body.topicName || body.topicId || null;

    if (Array.isArray(body)) {
      rawQuestions = body;
    } else if (Array.isArray(body.questions)) {
      rawQuestions = body.questions;
    } else if (body.questionText) {
      rawQuestions = [body];
    } else {
      return NextResponse.json(
        { error: 'Invalid payload. Expecting question object or array of questions.' },
        { status: 400 }
      );
    }

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided in payload' },
        { status: 400 }
      );
    }

    const results: any[] = [];
    const errors: any[] = [];

    // Cache to avoid duplicate database lookups in batch operations
    const examCache = new Map<string, any>();
    const subjectCache = new Map<string, any>();
    const topicCache = new Map<string, any>();

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];

      const examIdentifier = q.examCode || q.examName || q.examId || defaultExam || 'GENERAL';
      const subjectIdentifier = q.subjectName || q.subjectId || defaultSubject || 'General';
      const topicIdentifier = q.topicName || q.topicId || defaultTopic || 'General Knowledge';

      // 1. Resolve Exam
      let exam = examCache.get(examIdentifier.toLowerCase());
      if (!exam) {
        exam = await prisma.exam.findFirst({
          where: {
            OR: [
              { id: examIdentifier },
              { code: { equals: examIdentifier, mode: 'insensitive' } },
              { name: { equals: examIdentifier, mode: 'insensitive' } },
            ],
          },
        });

        if (!exam) {
          const code = examIdentifier.toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 20);
          exam = await prisma.exam.create({
            data: {
              name: examIdentifier,
              code: code || 'EXAM',
              description: `Auto-generated exam for ${examIdentifier}`,
            },
          });
        }
        examCache.set(examIdentifier.toLowerCase(), exam);
      }

      // 2. Resolve Subject under Exam
      const subjectKey = `${exam.id}:${subjectIdentifier.toLowerCase()}`;
      let subject = subjectCache.get(subjectKey);
      if (!subject) {
        subject = await prisma.subject.findFirst({
          where: {
            examId: exam.id,
            OR: [
              { id: subjectIdentifier },
              { name: { equals: subjectIdentifier, mode: 'insensitive' } },
            ],
          },
        });

        if (!subject) {
          subject = await prisma.subject.create({
            data: {
              examId: exam.id,
              name: subjectIdentifier,
              description: `Auto-generated subject for ${subjectIdentifier}`,
            },
          });
        }
        subjectCache.set(subjectKey, subject);
      }

      // 3. Resolve Topic under Subject
      const topicKey = `${subject.id}:${topicIdentifier.toLowerCase()}`;
      let topic = topicCache.get(topicKey);
      if (!topic) {
        topic = await prisma.topic.findFirst({
          where: {
            subjectId: subject.id,
            OR: [
              { id: topicIdentifier },
              { name: { equals: topicIdentifier, mode: 'insensitive' } },
            ],
          },
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              subjectId: subject.id,
              name: topicIdentifier,
            },
          });
        }
        topicCache.set(topicKey, topic);
      }

      // 4. Validate Question Fields
      const questionText = q.questionText?.trim();
      const optionA = q.optionA?.trim() ?? q.options?.[0]?.trim();
      const optionB = q.optionB?.trim() ?? q.options?.[1]?.trim();
      const optionC = q.optionC?.trim() ?? q.options?.[2]?.trim();
      const optionD = q.optionD?.trim() ?? q.options?.[3]?.trim();
      const correctAnswer = normalizeCorrectAnswer(q.correctAnswer ?? q.answer);
      const explanation = q.explanation?.trim() || 'No explanation provided.';
      const difficulty = normalizeDifficulty(q.difficulty);

      let tags = q.tags;
      if (Array.isArray(tags)) {
        tags = tags.join(', ');
      } else if (typeof tags !== 'string') {
        tags = null;
      }

      if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        errors.push({
          index: i,
          error: 'Missing required question text or options (A, B, C, D)',
          raw: q,
        });
        continue;
      }

      if (!correctAnswer) {
        errors.push({
          index: i,
          error: `Invalid correctAnswer "${q.correctAnswer}". Must be A, B, C, or D.`,
          raw: q,
        });
        continue;
      }

      // 5. Store Question in Database
      const savedQuestion = await prisma.question.create({
        data: {
          subjectId: subject.id,
          topicId: topic.id,
          questionText,
          imageUrl: q.imageUrl || null,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer,
          explanation,
          difficulty,
          tags,
        },
      });

      results.push({
        id: savedQuestion.id,
        exam: exam.name,
        subject: subject.name,
        topic: topic.name,
        questionText: savedQuestion.questionText,
      });
    }

    return NextResponse.json({
      success: true,
      storedCount: results.length,
      failedCount: errors.length,
      savedQuestions: results,
      errors: errors.length > 0 ? errors : undefined,
    }, { status: 201 });

  } catch (error: any) {
    console.error('AI Ingest API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while saving questions', details: error.message },
      { status: 500 }
    );
  }
}
