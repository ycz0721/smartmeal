'use client';

import { Badge } from '@/components/ui/badge';

const DEFAULT_TAGS = ['快手菜', '素食', '肉类', '海鲜', '汤羹', '适合儿童'];

interface TagFilterProps {
  selectedTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function TagFilter({ selectedTag, onTagChange }: TagFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {DEFAULT_TAGS.map((tag) => (
        <Badge
          key={tag}
          selected={selectedTag === tag}
          onClick={() => onTagChange(selectedTag === tag ? null : tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
