export function isVip(user: { isVip?: boolean; vipExpireAt?: string | Date | null } | null | undefined): boolean {
  if (!user) return false;
  if (!user.isVip) return false;
  if (!user.vipExpireAt) return false;
  return new Date(user.vipExpireAt) > new Date();
}
