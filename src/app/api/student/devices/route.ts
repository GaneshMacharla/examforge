import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, comparePassword } from '@/lib/auth';

// GET /api/student/devices -> Get registered devices for the current student
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const devices = await prisma.userDevice.findMany({
      where: { userId: user.id },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { deviceResetCooldownAt: true },
    });

    const now = new Date();
    const canReset =
      !dbUser?.deviceResetCooldownAt || now > new Date(dbUser.deviceResetCooldownAt);

    return NextResponse.json({
      devices,
      deviceCount: devices.length,
      maxDevices: 2,
      canReset,
      cooldownUntil: dbUser?.deviceResetCooldownAt,
    });
  } catch (error: unknown) {
    console.error('Fetch devices error:', error);
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

// POST /api/student/devices -> Reset registered devices (can ONLY be called by an authenticated user from their active dashboard)
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Device reset must be performed from an authenticated session or requested via administrator.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;
    const targetUserId = user.id;

    if (action === 'reset') {
      const dbUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { deviceResetCooldownAt: true },
      });

      const now = new Date();
      if (dbUser?.deviceResetCooldownAt && now < new Date(dbUser.deviceResetCooldownAt)) {
        const formattedDate = new Date(dbUser.deviceResetCooldownAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        return NextResponse.json(
          {
            error: `Device reset cooldown active. You can only reset registered devices once every 30 days. Next reset available on ${formattedDate}. Please contact admin support if you urgently changed your hardware.`,
          },
          { status: 429 }
        );
      }

      // Delete all registered devices for this user
      await prisma.userDevice.deleteMany({
        where: { userId: targetUserId },
      });

      // Set cooldown to 30 days from now
      const cooldownDate = new Date();
      cooldownDate.setDate(cooldownDate.getDate() + 30);

      await prisma.user.update({
        where: { id: targetUserId },
        data: { deviceResetCooldownAt: cooldownDate },
      });

      return NextResponse.json({
        success: true,
        message: 'Registered devices have been reset successfully. You can now log in from your current device.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Reset devices error:', error);
    return NextResponse.json({ error: 'Failed to reset devices' }, { status: 500 });
  }
}
