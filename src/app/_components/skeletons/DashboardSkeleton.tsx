import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-8 p-6">
      {/* LEFT CALENDAR */}
      <div className="col-span-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        {/* Week Header */}
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>

      {/* RIGHT SUMMARY */}
      <div className="col-span-4 space-y-6 rounded-xl border bg-card p-6">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>
    </div>
  );
}
