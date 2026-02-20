import { Skeleton } from "@/components/ui/skeleton";

export function ScheduledSkeleton() {
  return (
    <div className="p-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Status + Progress */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      {/* Month Section */}
      <div className="space-y-6">
        <Skeleton className="h-7 w-40" />

        <div className="grid grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-40 rounded-md" />
              <Skeleton className="h-8 w-40 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
