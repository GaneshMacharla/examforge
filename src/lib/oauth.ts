export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'sandbox';
}

export interface OAuthState {
  redirect?: string;
  deviceFingerprint?: string;
  deviceName?: string;
  demoRole?: 'STUDENT' | 'ADMIN';
  timestamp: number;
}

export function encodeOAuthState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString('base64url');
}

export function decodeOAuthState(encodedState: string): OAuthState | null {
  try {
    const json = Buffer.from(encodedState, 'base64url').toString('utf-8');
    return JSON.parse(json) as OAuthState;
  } catch {
    return null;
  }
}

export function getBaseUrl(req?: Request | { headers: Headers; nextUrl?: { origin: string; protocol: string; host: string } }): string {
  if (req) {
    const headers = 'headers' in req ? req.headers : null;
    const proto = headers?.get('x-forwarded-proto') || (('nextUrl' in req && req.nextUrl) ? req.nextUrl.protocol.replace(':', '') : 'http');
    const host = headers?.get('x-forwarded-host') || headers?.get('host') || (('nextUrl' in req && req.nextUrl) ? req.nextUrl.host : null);
    if (host) {
      return `${proto}://${host}`;
    }
    if ('nextUrl' in req && req.nextUrl?.origin) {
      return req.nextUrl.origin;
    }
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_ID.includes('placeholder')
  );
}

export function isEmailAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS || 'admin@examhub.com,admin@examforge.com')
    .toLowerCase()
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean);

  return adminEmails.includes(email.toLowerCase().trim());
}

// ==================== GOOGLE OAUTH ====================
export function getGoogleAuthUrl(stateStr: string, baseUrl?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${baseUrl || getBaseUrl()}/api/auth/callback/google`;
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: redirectUri,
    client_id: clientId || '',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    state: stateStr,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function getGoogleOAuthTokens(code: string, baseUrl?: string) {
  const url = 'https://oauth2.googleapis.com/token';
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: `${baseUrl || getBaseUrl()}/api/auth/callback/google`,
    grant_type: 'authorization_code',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(values).toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to exchange Google OAuth code: ${err}`);
  }

  return res.json();
}

export async function getGoogleUser(idToken: string, accessToken: string): Promise<OAuthProfile> {
  const res = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${accessToken}`,
    {
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch Google user profile');
  }

  const data = await res.json();
  return {
    id: data.id,
    email: data.email,
    name: data.name || data.email.split('@')[0],
    avatarUrl: data.picture,
    provider: 'google',
  };
}
