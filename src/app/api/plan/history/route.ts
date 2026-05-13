import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSpaceUserIds } from '@/lib/family';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const spaceUserIds = await getSpaceUserIds(session.user.id);

    const plans = await prisma.mealPlan.findMany({
      where: { userId: { in: spaceUserIds } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('获取历史计划失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
