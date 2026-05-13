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

    const recipes = await prisma.recipe.findMany({
      where: { userId: { in: spaceUserIds } },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    for (const r of recipes) {
      if (r.tags) {
        for (const tag of r.tags.split(',')) {
          const trimmed = tag.trim();
          if (trimmed) tagSet.add(trimmed);
        }
      }
    }

    // Sort by frequency (most common first)
    const tagCounts: Record<string, number> = {};
    for (const r of recipes) {
      if (r.tags) {
        for (const tag of r.tags.split(',')) {
          const t = tag.trim();
          if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      }
    }
    const sorted = [...tagSet].sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0));

    return NextResponse.json({ tags: sorted });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
