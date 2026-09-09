import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.identifier || body.email;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Mobile and password are required' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Check by email or mobile
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { mobile: identifier.trim() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/mobile or password' },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'This account uses OAuth authentication. Please sign in with Google or your OAuth provider.' },
        { status: 400 }
      );
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email/mobile or password' },
        { status: 401 }
      );
    }

    // --- Device Binding & Max 2 Devices Limit for Students ---
    if (user.role === 'STUDENT') {
      const MAX_DEVICES = 2;
      const clientFingerprint = (body.deviceFingerprint || 'dev_fallback_client').trim();
      const clientDeviceName = (body.deviceName || 'Web Browser').trim();

      const userDevices = await prisma.userDevice.findMany({
        where: { userId: user.id },
        orderBy: { lastActiveAt: 'desc' },
      });

      const existingDevice = userDevices.find(
        (d) => d.deviceFingerprint === clientFingerprint
      );

      if (existingDevice) {
        // Known device - update last active timestamp
        await prisma.userDevice.update({
          where: { id: existingDevice.id },
          data: {
            lastActiveAt: new Date(),
            deviceName: clientDeviceName,
          },
        });
      } else {
        // New device: check if limit reached
        if (userDevices.length >= MAX_DEVICES) {
          const now = new Date();
          const canReset =
            !user.deviceResetCooldownAt || now > new Date(user.deviceResetCooldownAt);

          return NextResponse.json(
            {
              error: 'DEVICE_LIMIT_EXCEEDED',
              message: `Device limit reached. Your student account is already registered on ${MAX_DEVICES} devices to prevent account sharing.`,
              registeredDevices: userDevices.map((d) => ({
                id: d.id,
                name: d.deviceName,
                lastActiveAt: d.lastActiveAt,
              })),
              canReset,
              cooldownUntil: user.deviceResetCooldownAt,
            },
            { status: 403 }
          );
        }

        // Register new authorized device
        await prisma.userDevice.create({
          data: {
            userId: user.id,
            deviceFingerprint: clientFingerprint,
            deviceName: clientDeviceName,
          },
        });
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        targetExam: user.targetExam,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed due to server error' },
      { status: 500 }
    );
  }
}
