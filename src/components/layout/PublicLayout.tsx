import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";

export function PublicLayout() {
  return (
    <div className="dark flex h-svh w-full overflow-hidden bg-background text-foreground">
      <div className="grid h-svh w-full lg:grid-cols-[1.1fr_1fr]">
        {/* ─── Hero Panel ─────────────────────────────────────── */}
        <div className="relative hidden overflow-hidden lg:block">
          <BubbleBackground
            interactive
            transition={{ stiffness: 120, damping: 25 }}
            className="flex h-full w-full flex-col"
          >
            {/* Gradient overlay for readability */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-12">
              {/* ── Logo (fades in first, pops on hover) ──── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="cursor-default"
              >
                <img
                  src="/TUHOP-Logo.png"
                  alt="TUHOP"
                  draggable={false}
                  className="size-64 select-none object-contain drop-shadow-[0_0_40px_rgba(0,0,0,0.6)] pointer-events-none"
                />
              </motion.div>

              {/* ── Banner (fades in after logo, reacts on hover) ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.03 }}
                className="cursor-default"
              >
                <img
                  src="/TUHOP-Banner.png"
                  alt="TUHOP"
                  draggable={false}
                  className="w-80 select-none object-contain drop-shadow-[0_0_25px_rgba(0,0,0,0.5)] pointer-events-none"
                />
              </motion.div>
            </div>
          </BubbleBackground>
        </div>

        {/* ─── Form Panel ────────────────────────────────────── */}
        <div className="flex items-center justify-center overflow-y-auto bg-background p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <img
                src="/TUHOP-Logo.png"
                alt="TUHOP"
                draggable={false}
                className="size-10 rounded-lg object-cover ring-2 ring-border select-none pointer-events-none"
              />
              <img
                src="/TUHOP-Banner.png"
                alt="TUHOP"
                draggable={false}
                className="h-5 select-none object-contain pointer-events-none"
              />
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
