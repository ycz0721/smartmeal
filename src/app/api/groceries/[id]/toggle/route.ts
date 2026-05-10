import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const item = await prisma.shoppingItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到' }, { status: 404 });
    }

    const newChecked = !item.checked;

    if (newChecked) {
      // CHECK: "已购买" → add to pantry
      const existing = await prisma.pantryItem.findFirst({
        where: { userId: session.user.id, name: item.name, unit: item.unit },
      });
      if (existing) {
        await prisma.pantryItem.update({
          where: { id: existing.id },
          data: { amount: { increment: item.amount } },
        });
      } else {
        await prisma.pantryItem.create({
          data: {
            userId: session.user.id,
            name: item.name,
            amount: item.amount,
            unit: item.unit,
          },
        });
      }
    } else {
      // UNCHECK: "取消购买" → deduct from pantry
      const pantryItem = await prisma.pantryItem.findFirst({
        where: { userId: session.user.id, name: item.name, unit: item.unit },
      });
      if (pantryItem) {
        const newAmount = Math.round((pantryItem.amount - item.amount) * 10) / 10;
        if (newAmount <= 0.05) {
          await prisma.pantryItem.delete({ where: { id: pantryItem.id } });
        } else {
          await prisma.pantryItem.update({
            where: { id: pantryItem.id },
            data: { amount: newAmount },
          });
        }
      }
    }

    const updated = await prisma.shoppingItem.update({
      where: { id },
      data: { checked: newChecked },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('切换购物项状态失败:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
