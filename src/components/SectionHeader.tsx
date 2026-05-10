import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  viewAllHref?: string;
}

export function SectionHeader({ title, showViewAll = false, onViewAll, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-page-title text-brand-text">{title}</h2>
      {showViewAll && (
        viewAllHref ? (
          <Link href={viewAllHref} className="flex items-center gap-0.5 text-sm text-orange-500">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <button onClick={onViewAll} className="flex items-center gap-0.5 text-sm text-orange-500">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        )
      )}
    </div>
  );
}
