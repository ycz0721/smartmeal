import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const { name, cookTime, imageUrl, tags, ingredients, steps, description } = body;

    if (!name) {
      return NextResponse.json({ error: '菜名不能为空' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await prisma.recipe.findFirst({
      where: {
        userId: session.user.id,
        title: name,
        favorite: true,
      },
    });

    if (existing) {
      return NextResponse.json({ alreadyExists: true, recipe: existing });
    }

    const recipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        title: name,
        description: description || `${name}，${cookTime || 25}分钟快手料理。`,
        servings: 2,
        cookTime: cookTime || 25,
        imageUrl: imageUrl || null,
        tags: (tags || ['家常菜']).join(','),
        ingredients: JSON.stringify(ingredients || []),
        steps: JSON.stringify(steps || []),
        source: '收藏',
        favorite: true,
      },
    });

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('收藏菜品失败:', error);
    return NextResponse.json({ error: '收藏失败' }, { status: 500 });
  }
}
