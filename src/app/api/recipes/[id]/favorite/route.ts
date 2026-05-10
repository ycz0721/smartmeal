import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: '食谱不存在' }, { status: 404 });
    }

    const updated = await prisma.recipe.update({
      where: { id },
      data: { favorite: !recipe.favorite },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('切换收藏失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
