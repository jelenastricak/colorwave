import { BrandCard } from "@/components/ui/brand-card";

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Brand Overview Skeleton */}
      <BrandCard className="space-y-4">
        <div className="h-8 bg-ink/10 rounded w-2/3" />
        <div className="h-4 bg-ink/10 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-4 bg-ink/10 rounded w-full" />
          <div className="h-4 bg-ink/10 rounded w-5/6" />
          <div className="h-4 bg-ink/10 rounded w-4/5" />
        </div>
      </BrandCard>

      {/* Color Palette Skeleton */}
      <BrandCard className="space-y-4">
        <div className="h-6 bg-ink/10 rounded w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-20 bg-ink/10 rounded-lg" />
              <div className="h-3 bg-ink/10 rounded w-3/4" />
              <div className="h-3 bg-ink/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      </BrandCard>

      {/* Typography Skeleton */}
      <BrandCard className="space-y-4">
        <div className="h-6 bg-ink/10 rounded w-1/4" />
        <div className="space-y-3">
          <div className="h-4 bg-ink/10 rounded w-2/3" />
          <div className="h-4 bg-ink/10 rounded w-3/5" />
        </div>
      </BrandCard>

      {/* Brand Voice Skeleton */}
      <BrandCard className="space-y-4">
        <div className="h-6 bg-ink/10 rounded w-1/3" />
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 bg-ink/10 rounded-full w-24" />
          ))}
        </div>
      </BrandCard>

      {/* Hero Section Skeleton */}
      <BrandCard className="space-y-4">
        <div className="h-6 bg-ink/10 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-5 bg-ink/10 rounded w-4/5" />
          <div className="h-4 bg-ink/10 rounded w-full" />
          <div className="h-4 bg-ink/10 rounded w-5/6" />
        </div>
      </BrandCard>
    </div>
  );
};
