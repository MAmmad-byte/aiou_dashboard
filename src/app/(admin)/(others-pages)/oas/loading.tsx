export default function OasApplicantsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-56 rounded bg-gray-200 dark:bg-white/[0.06]" />
          <div className="h-4 w-72 rounded bg-gray-100 dark:bg-white/[0.04]" />
        </div>
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-white/[0.06]" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-gray-200 dark:border-gray-800" />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 h-80 rounded-2xl border border-gray-200 dark:border-gray-800 xl:col-span-8" />
        <div className="col-span-12 h-80 rounded-2xl border border-gray-200 dark:border-gray-800 xl:col-span-4" />
        <div className="col-span-12 h-72 rounded-2xl border border-gray-200 dark:border-gray-800 xl:col-span-6" />
        <div className="col-span-12 h-72 rounded-2xl border border-gray-200 dark:border-gray-800 xl:col-span-6" />
        <div className="col-span-12 h-64 rounded-2xl border border-gray-200 dark:border-gray-800" />
      </div>
    </div>
  );
}
