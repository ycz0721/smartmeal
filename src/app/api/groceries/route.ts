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

    const { name, amount, unit } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: '食材名称不能为空' }, { status: 400 });
    }

    const item = await prisma.shoppingItem.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        amount: amount || 0,
        unit: unit || '个',
        checked: false,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('添加购物项失败:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const item = await prisma.shoppingItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到' }, { status: 404 });
    }

    await prisma.shoppingItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除购物项失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
