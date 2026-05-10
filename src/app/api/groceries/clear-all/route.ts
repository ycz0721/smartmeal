import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reconcileShoppingList } from '@/lib/shopping-calculator';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all shopping items
    const items = await prisma.shoppingItem.findMany({ where: { userId } });

    // Batch upsert into pantry
    for (const item of items) {
      const existing = await prisma.pantryItem.findFirst({
        where: { userId, name: item.name, unit: item.unit },
      });
      if (existing) {
        await prisma.pantryItem.update({
          where: { id: existing.id },
          data: { amount: { increment: item.amount } },
        });
      } else {
        await prisma.pantryItem.create({
          data: { userId, name: item.name, amount: item.amount, unit: item.unit },
        });
      }
    }

    // Delete all shopping items
    await prisma.shoppingItem.deleteMany({ where: { userId } });

    // Recalculate to get any remaining shortfall
    const remaining = await reconcileShoppingList(userId);

    return NextResponse.json({ cleared: items.length, remaining: remaining.length });
  } catch (error) {
    console.error('清空购物清单失败:', error);
    return NextResponse.json({ error: '清空失败' }, { status: 500 });
  }
}
