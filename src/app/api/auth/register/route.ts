import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, mobile, password, targetExam, deviceFingerprint, deviceName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobile ? mobile.trim() : null,
        passwordHash,
        role: 'STUDENT',
        targetExam: targetExam || 'SSC CGL',
      },
    });

    // Automatically bind the registering device as Device 1
    if (deviceFingerprint) {
      try {
        await prisma.userDevice.create({
          data: {
            userId: user.id,
            deviceFingerprint: deviceFingerprint.trim(),
            deviceName: (deviceName || 'Primary Device').trim(),
          },
        });
      } catch (devErr) {
        console.warn('Failed to bind initial device on signup', devErr);
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed due to server error' },
      { status: 500 }
    );
  }
}
