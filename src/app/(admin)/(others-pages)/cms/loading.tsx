import React from "react";

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-white/[0.06] ${className}`} />;
}

function ChartCardSkeleton({ height = "h-[280px]" }: { height?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <Pulse className="h-5 w-48" />
      <Pulse className="mt-2 h-4 w-64" />
      <Pulse className={`mt-4 w-full ${height}`} />
    </div>
  );
}

// Next.js renders this automatically while app/cms/page.tsx's async
// component (and its parallel Prisma queries) is still resolving — no
// Suspense boundary or loading state to wire up by hand. Shape matches the
// real dashboard (filters, 8 KPI cards, the same chart grid spans) so there's
// no layout jump when the real content swaps in.
export default function CmsLoading() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6">
        {/* Header + filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <Pulse className="h-6 w-72" />
            <Pulse className="mt-2 h-4 w-96" />
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Pulse key={i} className="h-[42px] w-[180px]" />
            ))}
          </div>
        </div>

        {/* 8 KPI cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6"
            >
              <Pulse className="h-12 w-12 rounded-xl" />
              <Pulse className="mt-5 h-4 w-20" />
              <Pulse className="mt-2 h-6 w-16" />
            </div>
          ))}
        </div>

        {/* Chart grid — same col-span layout as the real dashboard */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-8">
            <ChartCardSkeleton height="h-[320px]" />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <ChartCardSkeleton />
          </div>

          <div className="col-span-12 xl:col-span-4">
            <ChartCardSkeleton />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <ChartCardSkeleton />
          </div>
          <div className="col-span-12 xl:col-span-4">
            <ChartCardSkeleton />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <ChartCardSkeleton height="h-[300px]" />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <ChartCardSkeleton height="h-[300px]" />
          </div>

          <div className="col-span-12">
            <ChartCardSkeleton height="h-[320px]" />
          </div>

          <div className="col-span-12 xl:col-span-6">
            <ChartCardSkeleton />
          </div>
          <div className="col-span-12 xl:col-span-6">
            <ChartCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
