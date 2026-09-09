import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-exam-platform-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
  avatarUrl?: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        targetExam: true,
        avatarUrl: true,
        oauthProvider: true,
        createdAt: true,
      },
    });

    if (user) return user;
  } catch (dbErr) {
    console.warn('Database query failed in getCurrentUser, using token payload:', dbErr);
  }

  return {
    id: payload.userId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    mobile: null,
    targetExam: 'SSC CGL',
    avatarUrl: payload.avatarUrl,
    oauthProvider: 'oauth',
    createdAt: new Date(),
  };
}
