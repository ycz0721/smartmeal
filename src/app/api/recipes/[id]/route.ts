import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
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

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('获取食谱失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const recipe = await prisma.recipe.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!recipe) {
      return NextResponse.json({ error: '食谱不存在' }, { status: 404 });
    }

    const data: any = {};
    if (body.tags !== undefined) data.tags = body.tags;
    if (body.title !== undefined) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.cookTime !== undefined) data.cookTime = body.cookTime;
    if (body.servings !== undefined) data.servings = body.servings;
    if (body.ingredients !== undefined) data.ingredients = body.ingredients;
    if (body.steps !== undefined) data.steps = body.steps;

    const updated = await prisma.recipe.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('更新食谱失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
