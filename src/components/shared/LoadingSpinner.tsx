import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({ className, label }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="size-4 animate-spin rounded-full border-2 border-muted border-t-accent" />
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}
