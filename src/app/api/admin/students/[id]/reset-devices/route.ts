import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await getCurrentUser();

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetStudent = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!targetStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete devices
    const deleteResult = await prisma.userDevice.deleteMany({
      where: { userId: id },
    });

    // Clear reset cooldown
    await prisma.user.update({
      where: { id },
      data: { deviceResetCooldownAt: null },
    });

    return NextResponse.json({
      success: true,
      message: `Reset ${deleteResult.count} bound devices for student ${targetStudent.name}.`,
    });
  } catch (error: unknown) {
    console.error('Admin reset student devices error:', error);
    return NextResponse.json(
      { error: 'Failed to reset student devices' },
      { status: 500 }
    );
  }
}
