import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted p-8 text-center",
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/90"
        >
          {action.label}
        </button>
      ) : null}
    </motion.div>
  );
}
