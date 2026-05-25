export function ProductSkeleton() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-32 h-4 shimmer-bg rounded-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-3xl shimmer-bg" />
          <div className="space-y-4">
            <div className="w-24 h-3 shimmer-bg rounded-full" />
            <div className="w-3/4 h-10 shimmer-bg rounded-xl" />
            <div className="w-1/2 h-3 shimmer-bg rounded-full" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <div key={i} className="w-5 h-5 shimmer-bg rounded" />)}
            </div>
            <div className="h-28 shimmer-bg rounded-2xl" />
            <div className="w-full h-4 shimmer-bg rounded-full" />
            <div className="w-5/6 h-4 shimmer-bg rounded-full" />
            <div className="w-4/6 h-4 shimmer-bg rounded-full" />
            <div className="h-12 shimmer-bg rounded-xl" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 shimmer-bg rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
