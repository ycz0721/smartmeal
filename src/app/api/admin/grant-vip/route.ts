import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json({ error: '管理员密码错误' }, { status: 403 });
    }

    const { phone, days } = await req.json();
    if (!phone || !days) {
      return NextResponse.json({ error: '缺少手机号或天数' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + days);

    await prisma.user.update({
      where: { phone },
      data: { isVip: true, vipExpireAt: expireAt },
    });

    return NextResponse.json({ success: true, message: `已为 ${phone} 开通 ${days} 天会员，到期时间 ${expireAt.toISOString()}` });
  } catch (error) {
    console.error('Grant VIP error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
