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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { intolerances: true },
    });
    const list = user?.intolerances ? user.intolerances.split(',').filter(Boolean) : [];
    return NextResponse.json({ intolerances: list });
  } catch (error) {
    console.error('获取不耐受列表失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    const { item } = await req.json();
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: '无效的食材名称' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { intolerances: true },
    });
    const list = user?.intolerances ? user.intolerances.split(',').filter(Boolean) : [];
    if (list.includes(item)) {
      return NextResponse.json({ intolerances: list });
    }
    list.push(item);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { intolerances: list.join(',') },
    });
    return NextResponse.json({ intolerances: list });
  } catch (error) {
    console.error('添加不耐受食材失败:', error);
    return NextResponse.json({ error: '添加失败' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    const { item } = await req.json();
    if (!item || typeof item !== 'string') {
      return NextResponse.json({ error: '无效的食材名称' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { intolerances: true },
    });
    const list = user?.intolerances ? user.intolerances.split(',').filter(Boolean) : [];
    const updated = list.filter((i) => i !== item);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { intolerances: updated.join(',') },
    });
    return NextResponse.json({ intolerances: updated });
  } catch (error) {
    console.error('删除不耐受食材失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
