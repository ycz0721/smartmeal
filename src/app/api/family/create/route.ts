import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function generateInviteCode(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // Check if user already owns a space
    let space = await prisma.familySpace.findFirst({
      where: { ownerId: session.user.id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, phone: true } } },
        },
      },
    });

    if (!space) {
      // Generate unique invite code
      let inviteCode: string;
      let attempts = 0;
      do {
        inviteCode = generateInviteCode();
        const existing = await prisma.familySpace.findUnique({ where: { inviteCode } });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      space = await prisma.familySpace.create({
        data: {
          inviteCode,
          ownerId: session.user.id,
          members: {
            create: { userId: session.user.id },
          },
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, phone: true } } },
          },
        },
      });
    }

    return NextResponse.json({
      inviteCode: space.inviteCode,
      members: space.members.map((m) => ({
        id: m.user.id,
        name: m.user.name || '用户',
        phone: m.user.phone,
      })),
    });
  } catch (error) {
    console.error('Create family space error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
