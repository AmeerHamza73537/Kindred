export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-ink/10 ${className}`} />;
}

export function ItemCardSkeleton() {
  return (
    <div className="space-y-3 rounded-2xl border border-ink/5 bg-white p-3 shadow-sm">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
