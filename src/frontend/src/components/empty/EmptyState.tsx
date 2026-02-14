import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  imageSrc?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ title, description, imageSrc, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {imageSrc && (
        <img src={imageSrc} alt={title} className="w-64 h-auto mb-6 opacity-80" />
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
