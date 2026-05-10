import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;

    const item = await prisma.pantryItem.findUnique({
      where: { id },
    });

    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: '未找到' }, { status: 404 });
    }

    await prisma.pantryItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除储藏室食材失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
