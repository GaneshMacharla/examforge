import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import {
  decodeOAuthState,
  getGoogleOAuthTokens,
  getGoogleUser,
  isEmailAdmin,
  getBaseUrl,
  OAuthProfile,
} from '@/lib/oauth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const baseUrl = getBaseUrl(request);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const state = stateParam ? decodeOAuthState(stateParam) : null;
  const redirectTarget = state?.redirect || '/student/dashboard';
  const clientFingerprint = (state?.deviceFingerprint || 'web_oauth_client').trim();
  const clientDeviceName = (state?.deviceName || 'OAuth Web Client').trim();

  if (errorParam) {
    console.error(`OAuth error received from ${provider}:`, errorParam);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(`Authentication cancelled or failed: ${errorParam}`)}`
    );
  }

  try {
    let profile: OAuthProfile;

    if (provider === 'google') {
      if (!code) throw new Error('Authorization code missing from Google callback');
      const tokens = await getGoogleOAuthTokens(code, baseUrl);
      profile = await getGoogleUser(tokens.id_token, tokens.access_token);
    } else if (provider === 'sandbox') {
      // Sandbox / Mock OAuth for instant local development
      const isDemoAdmin = state?.demoRole === 'ADMIN';
      const mockProvider = (searchParams.get('mockProvider') as 'google' | 'sandbox') || 'sandbox';

      if (isDemoAdmin) {
        profile = {
          id: 'sandbox_admin_001',
          email: 'admin@examhub.com',
          name: 'Demo Platform Admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          provider: mockProvider,
        };
      } else {
        profile = {
          id: 'sandbox_student_001',
          email: 'rahul.aspirant@gmail.com',
          name: 'Rahul Sharma',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          provider: mockProvider,
        };
      }
    } else {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(`Unsupported provider: ${provider}`)}`
      );
    }

    const cleanEmail = profile.email.toLowerCase().trim();
    const isAdmin = isEmailAdmin(cleanEmail) || state?.demoRole === 'ADMIN';
    const assignedRole = isAdmin ? 'ADMIN' : 'STUDENT';

    let dbUserId = profile.id;
    let finalRole = assignedRole;
    let finalName = profile.name;
    let finalAvatar = profile.avatarUrl;

    try {
      // Find or create User
      let user = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
            oauthProvider: profile.provider,
            oauthId: profile.id,
            role: assignedRole,
            targetExam: 'SSC CGL',
          },
        });
      } else {
        // Update metadata on subsequent OAuth logins
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name || profile.name,
            avatarUrl: profile.avatarUrl || user.avatarUrl,
            oauthProvider: profile.provider,
            oauthId: profile.id,
            role: isAdmin ? 'ADMIN' : user.role,
          },
        });
      }

      dbUserId = user.id;
      finalRole = user.role;
      finalName = user.name;
      finalAvatar = user.avatarUrl || profile.avatarUrl;

      // --- Enforce Single-User & 2-Device Binding for Students ---
      if (user.role === 'STUDENT') {
        const MAX_DEVICES = 2;
        const userDevices = await prisma.userDevice.findMany({
          where: { userId: user.id },
          orderBy: { lastActiveAt: 'desc' },
        });

        const existingDevice = userDevices.find(
          (d) => d.deviceFingerprint === clientFingerprint
        );

        if (existingDevice) {
          await prisma.userDevice.update({
            where: { id: existingDevice.id },
            data: {
              lastActiveAt: new Date(),
              deviceName: clientDeviceName,
            },
          });
        } else {
          if (userDevices.length >= MAX_DEVICES) {
            return NextResponse.redirect(
              `${baseUrl}/login?error=DEVICE_LIMIT_EXCEEDED&count=${userDevices.length}`
            );
          }

          await prisma.userDevice.create({
            data: {
              userId: user.id,
              deviceFingerprint: clientFingerprint,
              deviceName: clientDeviceName,
            },
          });
        }
      }
    } catch (dbErr) {
      console.warn('Database offline or unreachable during OAuth login. Proceeding with OAuth session payload:', dbErr);
    }

    // Generate JWT token
    const token = generateToken({
      userId: dbUserId,
      email: cleanEmail,
      role: finalRole,
      name: finalName,
      avatarUrl: finalAvatar,
    });

    // Destination
    const destination =
      finalRole === 'ADMIN'
        ? '/admin'
        : redirectTarget.startsWith('/login')
        ? '/student/dashboard'
        : redirectTarget;

    const response = NextResponse.redirect(new URL(destination, baseUrl));

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('OAuth callback execution error:', err);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(err.message || 'OAuth authentication failed')}`
    );
  }
}
