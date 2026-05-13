import { prisma } from '@/lib/prisma';

export async function getSpaceUserIds(userId: string): Promise<string[]> {
  const member = await prisma.familyMember.findFirst({
    where: { userId },
    include: {
      space: {
        include: {
          members: { select: { userId: true } },
        },
      },
    },
  });

  if (!member) return [userId];
  return member.space.members.map((m) => m.userId);
}
