export default function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
}
