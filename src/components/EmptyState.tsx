import { Card } from './ui/card';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="py-12 text-center">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p className="text-sm text-brand-secondary mb-1">{title}</p>
      {description && <p className="text-xs text-brand-secondary mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="text-orange-500 text-sm font-medium"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
}
