import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { cuisines: true, intolerances: true, dietary: true, familySize: true, mealPeople: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用户未找到' }, { status: 404 });
    }

    return NextResponse.json({
      cuisines: user.cuisines ? user.cuisines.split(',') : [],
      intolerances: user.intolerances ? user.intolerances.split(',') : [],
      dietary: user.dietary ? user.dietary.split(',') : [],
      familySize: user.familySize,
      mealPeople: user.mealPeople || '',
    });
  } catch (error) {
    console.error('获取用户偏好失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await req.json();
    const data: Record<string, any> = {};

    if (body.cuisines !== undefined) {
      data.cuisines = Array.isArray(body.cuisines) ? body.cuisines.join(',') : body.cuisines;
    }
    if (body.intolerances !== undefined) {
      data.intolerances = Array.isArray(body.intolerances) ? body.intolerances.join(',') : body.intolerances;
    }
    if (body.dietary !== undefined) {
      data.dietary = Array.isArray(body.dietary) ? body.dietary.join(',') : body.dietary;
    }
    if (body.familySize !== undefined) {
      data.familySize = body.familySize;
    }
    if (body.mealPeople !== undefined) {
      data.mealPeople = body.mealPeople;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('保存用户偏好失败:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
