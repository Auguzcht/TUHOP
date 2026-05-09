import { cn } from "@/lib/utils";

type PlaceholderPageProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PlaceholderPage({
  title,
  description,
  className,
}: PlaceholderPageProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {description ?? "This page is coming next."}
      </p>
    </div>
  );
}
