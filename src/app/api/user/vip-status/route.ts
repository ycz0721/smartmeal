import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isVip: true, vipExpireAt: true },
    });
    return NextResponse.json({ isVip: user?.isVip || false, vipExpireAt: user?.vipExpireAt || null });
  } catch {
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
