import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reconcileShoppingList } from '@/lib/shopping-calculator';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // Always recalculate from scratch so the list reflects current plan and pantry
    const items = await reconcileShoppingList(session.user.id);
    return NextResponse.json(items);
  } catch (error) {
    console.error('获取购物清单失败:', error);
    return NextResponse.json({ error: '获取购物清单失败' }, { status: 500 });
  }
}
