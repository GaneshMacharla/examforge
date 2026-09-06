import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, csvContent, subjectId, topicId, validRowsToImport } = await request.json();

    if (action === 'validate') {
      if (!csvContent || typeof csvContent !== 'string') {
        return NextResponse.json({ error: 'CSV content is required' }, { status: 400 });
      }

      const parsed = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      });

      if (parsed.errors && parsed.errors.length > 0 && parsed.data.length === 0) {
        return NextResponse.json(
          { error: `CSV Parsing error: ${parsed.errors[0].message}` },
          { status: 400 }
        );
      }

      const rows: any[] = parsed.data;
      const validRows: any[] = [];
      const errors: Array<{ rowNumber: number; issue: string; raw: any }> = [];

      rows.forEach((row, index) => {
        const rowNum = index + 2; // account for 1-indexed and header row

        // Find keys with case-insensitivity
        const getField = (...keys: string[]) => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
              return String(row[k]).trim();
            }
          }
          return '';
        };

        const question = getField('question', 'question text', 'questiontext');
        const optionA = getField('option a', 'option_a', 'optiona', 'a');
        const optionB = getField('option b', 'option_b', 'optionb', 'b');
        const optionC = getField('option c', 'option_c', 'optionc', 'c');
        const optionD = getField('option d', 'option_d', 'optiond', 'd');
        const answer = getField('answer', 'correct answer', 'correct_answer', 'correctanswer').toUpperCase();
        const explanation = getField('explanation', 'solution', 'rationale');
        const difficulty = getField('difficulty') || 'Medium';
        const tags = getField('tags', 'tag');

        if (!question) {
          errors.push({ rowNumber: rowNum, issue: 'Missing question text', raw: row });
          return;
        }
        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push({
            rowNumber: rowNum,
            issue: 'All 4 options (A, B, C, D) are required',
            raw: row,
          });
          return;
        }
        if (!['A', 'B', 'C', 'D'].includes(answer)) {
          errors.push({
            rowNumber: rowNum,
            issue: `Invalid answer "${answer}". Must be A, B, C, or D.`,
            raw: row,
          });
          return;
        }
        if (!explanation) {
          errors.push({
            rowNumber: rowNum,
            issue: 'Missing explanation/solution',
            raw: row,
          });
          return;
        }

        validRows.push({
          questionText: question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: answer,
          explanation,
          difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
          tags,
        });
      });

      return NextResponse.json({
        success: true,
        totalDetected: rows.length,
        validCount: validRows.length,
        errorCount: errors.length,
        errors,
        validRows,
      });
    }

    if (action === 'import') {
      if (!subjectId || !topicId) {
        return NextResponse.json(
          { error: 'Subject and Topic selection required for import' },
          { status: 400 }
        );
      }

      if (!validRowsToImport || !Array.isArray(validRowsToImport) || validRowsToImport.length === 0) {
        return NextResponse.json({ error: 'No valid rows to import' }, { status: 400 });
      }

      // Verify subject and topic exist
      const topic = await prisma.topic.findUnique({ where: { id: topicId } });
      if (!topic) {
        return NextResponse.json({ error: 'Selected topic does not exist' }, { status: 404 });
      }

      let imported = 0;
      for (const row of validRowsToImport) {
        await prisma.question.create({
          data: {
            subjectId,
            topicId,
            questionText: row.questionText,
            optionA: row.optionA,
            optionB: row.optionB,
            optionC: row.optionC,
            optionD: row.optionD,
            correctAnswer: row.correctAnswer,
            explanation: row.explanation,
            difficulty: row.difficulty,
            tags: row.tags || null,
          },
        });
        imported++;
      }

      return NextResponse.json({
        success: true,
        importedCount: imported,
        message: `Successfully imported ${imported} questions into the question bank!`,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Bulk upload processing failed' },
      { status: 500 }
    );
  }
}
