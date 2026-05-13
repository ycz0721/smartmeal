import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const member = await prisma.familyMember.findFirst({
      where: { userId: session.user.id },
      include: { space: true },
    });

    if (!member) {
      return NextResponse.json({ error: '你不在任何家庭空间中' }, { status: 400 });
    }

    if (member.space.ownerId === session.user.id) {
      // Owner leaves → dissolve entire space
      await prisma.familyMember.deleteMany({ where: { spaceId: member.spaceId } });
      await prisma.familySpace.delete({ where: { id: member.spaceId } });
    } else {
      // Regular member leaves
      await prisma.familyMember.delete({ where: { id: member.id } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave family error:', error);
    return NextResponse.json({ error: '退出失败' }, { status: 500 });
  }
}
