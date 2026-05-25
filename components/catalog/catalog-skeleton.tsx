export function CatalogSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      {/* Header skeleton */}
      <div className="bg-surface border-b border-border px-4 py-6 space-y-4">
        <div className="w-48 h-8 shimmer-bg rounded-xl" />
        <div className="h-11 shimmer-bg rounded-xl" />
        <div className="flex gap-2 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-24 h-8 shimmer-bg rounded-full" />
          ))}
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="h-48 shimmer-bg" />
              <div className="p-4 space-y-2">
                <div className="w-16 h-3 shimmer-bg rounded-full" />
                <div className="w-full h-4 shimmer-bg rounded-full" />
                <div className="w-3/4 h-4 shimmer-bg rounded-full" />
                <div className="w-20 h-6 shimmer-bg rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
