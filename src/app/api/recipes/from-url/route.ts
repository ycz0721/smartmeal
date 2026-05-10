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

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL不能为空' }, { status: 400 });
    }

    let pageText = '';
    try {
      const response = await fetch(url);
      const html = await response.text();
      pageText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 3000);
    } catch {
      pageText = url;
    }

    let recipe;
    try {
      const systemPrompt = `你是食谱解析专家。从网页文本中提取食谱信息，必须返回 JSON 格式。

输出 JSON 结构：
{
  "title": "菜名",
  "description": "简短描述，20字以内",
  "servings": 4,
  "cookTime": 30,
  "tags": ["标签1", "标签2"],
  "ingredients": [{"name":"食材名","amount":数量,"unit":"单位"}],
  "steps": ["步骤1", "步骤2"]
}

要求：所有文字用中文。单位用克、毫升、个、茶匙、汤匙等中文单位。如果无法提取到完整信息，给出合理的近似内容。`;

      const userPrompt = `从以下网页文本中提取食谱：\n\n${pageText}`;

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
        title: '来自链接的食谱',
        description: '从分享链接导入的食谱。',
        servings: 4,
        cookTime: 30,
        tags: ['导入', '网络食谱'],
        ingredients: [
          { name: '食材', amount: 300, unit: '克' },
          { name: '调料', amount: 1, unit: '茶匙' },
        ],
        steps: ['请查看原链接获取详细步骤。'],
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
        source: url,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error('解析URL失败:', error);
    return NextResponse.json({ error: '解析URL失败' }, { status: 500 });
  }
}
