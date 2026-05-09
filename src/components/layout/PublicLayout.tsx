import { Outlet } from "react-router-dom";
import { Droplets } from "lucide-react";
import { motion } from "framer-motion";

export function PublicLayout() {
  return (
    <div className="dark min-h-svh bg-background text-foreground">
      <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
        {/* ─── Hero Panel (hidden on mobile) ─────────────────────── */}
        <div className="relative hidden items-center justify-center overflow-hidden border-r border-border/40 bg-gradient-to-b from-[oklch(0.14_0.025_240)] to-[oklch(0.18_0.025_240)] p-10 lg:flex">
          {/* Decorative gradient orbs */}
          <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-accent/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 size-80 rounded-full bg-accent/8 blur-3xl" />

          <motion.div
            className="relative max-w-sm space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Logo mark */}
            <motion.div
              className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 ring-1 ring-accent/20"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Droplets className="size-8 text-accent" />
            </motion.div>

            <div className="space-y-3">
              <div className="text-xs font-medium uppercase tracking-[0.3em] text-accent">
                TUHOP
              </div>
              <h1 className="text-3xl font-heading leading-tight text-foreground">
                Flood Reporting Platform
              </h1>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Turning Data into Direction, Hope into Action.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="space-y-3 pt-4">
              {[
                "AI-powered severity classification",
                "Real-time validation by CDRRMO experts",
                "District-level flood monitoring",
              ].map((text, i) => (
                <motion.div
                  key={text}
                  className="flex items-center gap-3 text-xs text-muted-foreground"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                >
                  <span className="flex size-1.5 shrink-0 rounded-full bg-accent/60" />
                  {text}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Form Panel ────────────────────────────────────────── */}
        <motion.div
          className="flex items-center justify-center p-6 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
