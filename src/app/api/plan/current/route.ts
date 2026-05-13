import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSpaceUserIds } from '@/lib/family';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const spaceUserIds = await getSpaceUserIds(session.user.id);

    const plan = await prisma.mealPlan.findFirst({
      where: {
        userId: { in: spaceUserIds },
        isCurrent: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      return NextResponse.json(null);
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Fetch current plan error:', error);
    return NextResponse.json({ error: '获取计划失败' }, { status: 500 });
  }
}
