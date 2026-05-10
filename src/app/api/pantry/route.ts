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

    const items = await prisma.pantryItem.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('获取储藏室失败:', error);
    return NextResponse.json({ error: '获取储藏室失败' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { name, amount, unit } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '食材名称不能为空' }, { status: 400 });
    }

    const item = await prisma.pantryItem.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        amount: amount || 0,
        unit: unit || '个',
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('添加储藏室食材失败:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}
