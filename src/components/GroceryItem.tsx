import { Checkbox } from '@/components/ui/checkbox';

interface GroceryItemProps {
  item: {
    id: string;
    name: string;
    amount: number;
    unit: string;
    checked: boolean;
  };
  onToggle: (id: string) => void;
}

export function GroceryItem({ item, onToggle }: GroceryItemProps) {
  return (
    <div className="flex items-center gap-3 py-3 border-b">
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
      />
      <div className="flex-1">
        <span
          className={`${
            item.checked ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {item.name}
        </span>
      </div>
      <span className="text-sm text-gray-600">
        {item.amount}
        {item.unit}
      </span>
    </div>
  );
}
