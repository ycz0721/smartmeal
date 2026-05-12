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

    const { inviteCode } = await req.json();
    if (!inviteCode || typeof inviteCode !== 'string' || inviteCode.length !== 8) {
      return NextResponse.json({ error: '邀请码格式不正确' }, { status: 400 });
    }

    const space = await prisma.familySpace.findUnique({
      where: { inviteCode },
      include: { owner: { select: { name: true } } },
    });

    if (!space) {
      return NextResponse.json({ error: '邀请码无效，请检查后重试' }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.familyMember.findUnique({
      where: { spaceId_userId: { spaceId: space.id, userId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: '你已经在这个家庭空间了', alreadyMember: true }, { status: 409 });
    }

    await prisma.familyMember.create({
      data: { spaceId: space.id, userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: `加入成功！你已加入 ${space.owner.name || '用户'} 的家庭空间`,
    });
  } catch (error) {
    console.error('Join family error:', error);
    return NextResponse.json({ error: '加入失败' }, { status: 500 });
  }
}
