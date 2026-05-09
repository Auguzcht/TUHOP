import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="dark min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
        <div className="hidden items-center justify-center border-r border-border/40 bg-[oklch(0.16_0.02_240)] p-10 lg:flex">
          <div className="max-w-sm space-y-4">
            <div className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
              TUHOP
            </div>
            <h1 className="text-3xl font-heading text-foreground">
              Flood Reporting Platform
            </h1>
            <p className="text-sm text-muted-foreground">
              Turning Data into Direction, Hope into Action.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
