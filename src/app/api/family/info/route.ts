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

    const member = await prisma.familyMember.findFirst({
      where: { userId: session.user.id },
      include: {
        space: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, phone: true } } },
            },
            owner: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ space: null });
    }

    const space = member.space;
    return NextResponse.json({
      space: {
        id: space.id,
        inviteCode: space.inviteCode,
        isOwner: space.ownerId === session.user.id,
        owner: {
          id: space.owner.id,
          name: space.owner.name || '用户',
          phone: space.owner.phone,
        },
        members: space.members.map((m) => ({
          id: m.user.id,
          name: m.user.name || '用户',
          phone: m.user.phone,
        })),
      },
    });
  } catch (error) {
    console.error('Get family info error:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
