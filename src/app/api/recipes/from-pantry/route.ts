import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { callAI } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const pantryItems = await prisma.pantryItem.findMany({
      where: { userId: session.user.id },
    });

    if (pantryItems.length === 0) {
      return NextResponse.json({ error: '冰箱没有食材' }, { status: 400 });
    }

    const pantryList = pantryItems
      .map((item) => `${item.name} ${item.amount}${item.unit}`)
      .join('、');

    let recipe;
    try {
      const systemPrompt = `你是创意厨师。根据用户现有食材推荐一道菜，必须返回 JSON 格式。

输出 JSON 结构：
{
  "title": "菜名",
  "description": "简短描述，20字以内",
  "servings": 2,
  "cookTime": 20,
  "tags": ["快手", "家常"],
  "ingredients": [{"name":"食材名","amount":数量,"unit":"单位"}],
  "steps": ["步骤1", "步骤2"]
}

要求：尽量使用用户提供的食材，可适当补充常见调料（盐、酱油等）。所有文字用中文。单位用克、毫升、个、茶匙、汤匙、根、瓣等。`;

      const userPrompt = `我有这些食材：${pantryList}。请推荐一道菜。`;

      recipe = await callAI<{
        title: string;
        description: string;
        servings: number;
        cookTime: number;
        tags: string[];
        ingredients: { name: string; amount: number; unit: string }[];
        steps: string[];
      }>(systemPrompt, userPrompt);
    } catch {
      recipe = {
        title: '冰箱创意料理',
        description: `根据您的食材推荐的创意料理。`,
        servings: 2,
        cookTime: 20,
        tags: ['创意料理', '清冰箱'],
        ingredients: pantryItems.map((item) => ({
          name: item.name,
          amount: item.amount,
          unit: item.unit,
        })),
        steps: ['准备所有食材，检查新鲜度。', '根据食材特点选择合适烹饪方式。', '依次处理食材，注意火候。', '调味装盘，趁热享用。'],
      };
    }

    const created = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        cookTime: recipe.cookTime,
        tags: recipe.tags.join(','),
        ingredients: JSON.stringify(recipe.ingredients),
        steps: JSON.stringify(recipe.steps),
        source: '冰箱',
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('根据冰箱生成食谱失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}
