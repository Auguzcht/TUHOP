import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "size-3 border-2",
  md: "size-5 border-2",
  lg: "size-8 border-[3px]",
};

export function LoadingSpinner({
  className,
  label,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className={cn("flex flex-col items-center justify-center gap-3", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={cn(
          "rounded-full border-muted border-t-accent",
          sizeMap[size]
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      {label ? (
        <span className="text-xs text-muted-foreground">{label}</span>
      ) : null}
    </motion.div>
  );
}
