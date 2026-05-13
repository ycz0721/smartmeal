import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSpaceUserIds } from '@/lib/family';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    const favorite = searchParams.get('favorite');
    const spaceUserIds = await getSpaceUserIds(session.user.id);

    const where: any = { userId: { in: spaceUserIds } };

    if (tag) {
      where.tags = { contains: tag };
    }

    if (favorite === 'true') {
      where.favorite = true;
    } else {
      where.source = { not: '收藏' };
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('获取食谱失败:', error);
    return NextResponse.json({ error: '获取食谱失败' }, { status: 500 });
  }
}
