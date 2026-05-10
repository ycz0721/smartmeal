import { Card } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function RecipeListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-[#EEEEEE]">
          <div className="w-5 h-5 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
