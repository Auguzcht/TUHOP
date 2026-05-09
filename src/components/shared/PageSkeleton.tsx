import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageSkeletonProps = {
  className?: string;
};

export function PageSkeleton({ className }: PageSkeletonProps) {
  return (
    <motion.div
      className={cn("flex flex-col gap-6", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Table filters skeleton */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <Skeleton className="h-72 rounded-xl" />
    </motion.div>
  );
}
