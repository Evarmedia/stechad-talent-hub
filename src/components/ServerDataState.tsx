import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { title?: string; error?: string | null; onRetry?: () => void };

export default function ServerDataState({ title = "Loading data", error, onRetry }: Props) {
  return (
    <div className="space-y-6 p-4 md:p-8" aria-busy={!error}>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {error ? <div role="alert" className="space-y-3 rounded-lg border p-6">
        <p className="font-medium">Could not load this data.</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
      </div> : <div role="status" className="space-y-6">
        <span className="sr-only">Loading {title.toLowerCase()}…</span>
        <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map(item => <Skeleton key={item} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>}
    </div>
  );
}
