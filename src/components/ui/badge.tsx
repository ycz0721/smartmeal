import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes } from 'react';

interface BadgeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Badge({ selected = false, className, children, ...props }: BadgeProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors min-h-[32px]',
        selected
          ? 'bg-orange-500 text-white'
          : 'bg-white text-orange-500 border border-orange-500',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
