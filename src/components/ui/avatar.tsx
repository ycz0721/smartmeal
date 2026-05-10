import { cn } from '@/lib/utils';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
}

export function Avatar({ name, src, size = 48, className }: AvatarProps) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';

  if (src) {
    return (
      <div
        className={cn('rounded-full overflow-hidden flex-shrink-0 ring-2 ring-orange-500', className)}
        style={{ width: size, height: size }}
      >
        <img src={src} alt={name || ''} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0 ring-2 ring-orange-500',
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
