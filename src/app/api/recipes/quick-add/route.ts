import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { callAI } from '@/lib/ai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const { dishName } = await req.json();
    if (!dishName) {
      return NextResponse.json({ error: '菜名不能为空' }, { status: 400 });
    }

    let recipe;
    try {
      const systemPrompt = `你是一名专业厨师。根据菜名生成完整食谱，必须返回 JSON 格式。

输出 JSON 结构：
{
  "title": "菜名",
  "description": "简短描述，20字以内",
  "servings": 4,
  "cookTime": 30,
  "tags": ["中餐", "家常"],
  "ingredients": [{"name":"食材名","amount":数量,"unit":"单位"}],
  "steps": ["步骤1", "步骤2"]
}

要求：所有文字用中文。单位用克、毫升、个、茶匙、汤匙、根、瓣等。步骤详细清晰，3-7步。`;

      const userPrompt = `请为"${dishName}"生成完整食谱。`;

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
        title: dishName,
        description: `${dishName}是一道美味可口的家常菜。`,
        servings: 4,
        cookTime: 25,
        tags: ['家常菜', '中餐'],
        ingredients: [
          { name: '主料', amount: 500, unit: '克' },
          { name: '盐', amount: 1, unit: '茶匙' },
          { name: '酱油', amount: 2, unit: '汤匙' },
          { name: '食用油', amount: 3, unit: '汤匙' },
        ],
        steps: ['准备所有食材，清洗干净并切好备用。', '锅中倒入食用油，中火加热。', '放入主料翻炒至变色。', '加入调味料，翻炒均匀。', '出锅装盘，趁热享用。'],
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
        source: '快速添加',
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('快速添加食谱失败:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}
