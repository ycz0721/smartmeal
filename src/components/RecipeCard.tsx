import { Card, CardContent } from './ui/card';
import { Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  cookTime: number;
  servings: number;
  imageUrl?: string;
  tags: string;
}

export function RecipeCard({
  id,
  title,
  description,
  cookTime,
  servings,
  imageUrl,
  tags,
}: RecipeCardProps) {
  return (
    <Link href={`/recipes/${id}`}>
      <Card className="hover:shadow-md transition-shadow">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{cookTime}分钟</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{servings}人份</span>
            </div>
          </div>
          {tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.split(',').slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
