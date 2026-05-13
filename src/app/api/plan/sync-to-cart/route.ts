import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reconcileShoppingList } from '@/lib/shopping-calculator';
import { getSpaceUserIds } from '@/lib/family';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const spaceUserIds = await getSpaceUserIds(session.user.id);

    const items = await reconcileShoppingList(session.user.id, spaceUserIds);
    return NextResponse.json({ count: items.length });
  } catch (error) {
    console.error('同步购物清单失败:', error);
    return NextResponse.json({ error: '同步失败' }, { status: 500 });
  }
}
