import { NextRequest, NextResponse } from 'next/server';
import {
  encodeOAuthState,
  getGoogleAuthUrl,
  isGoogleConfigured,
  getBaseUrl,
} from '@/lib/oauth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const baseUrl = getBaseUrl(request);
  const searchParams = request.nextUrl.searchParams;

  const redirect = searchParams.get('redirect') || '/student/dashboard';
  const deviceFingerprint = searchParams.get('deviceFingerprint') || 'web_client';
  const deviceName = searchParams.get('deviceName') || 'Browser Device';
  const demoRole = (searchParams.get('demoRole') || 'STUDENT') as 'STUDENT' | 'ADMIN';

  const stateStr = encodeOAuthState({
    redirect,
    deviceFingerprint,
    deviceName,
    demoRole,
    timestamp: Date.now(),
  });

  if (provider === 'google') {
    if (!isGoogleConfigured()) {
      // If Google credentials aren't in .env yet, redirect to sandbox mock OAuth flow
      return NextResponse.redirect(
        `${baseUrl}/api/auth/callback/sandbox?state=${encodeURIComponent(stateStr)}&mockProvider=google`
      );
    }
    const authUrl = getGoogleAuthUrl(stateStr, baseUrl);
    return NextResponse.redirect(authUrl);
  }


  if (provider === 'sandbox') {
    return NextResponse.redirect(
      `${baseUrl}/api/auth/callback/sandbox?state=${encodeURIComponent(stateStr)}`
    );
  }

  return NextResponse.json({ error: `Unsupported OAuth provider: ${provider}` }, { status: 400 });
}
