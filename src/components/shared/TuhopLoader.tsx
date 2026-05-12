import { useMemo } from "react";
import { motion } from "framer-motion";

type TuhopLoaderProps = {
  /** "minimal" — logo only, for refresh. "full" — animated, for login/logout. */
  variant?: "minimal" | "full";
};

const BG_SHAPES = Array.from({ length: 12 }, (_, i) => i);

function shapeAt(i: number) {
  const types = ["circle", "square", "triangle"] as const;
  return {
    type: types[i % 3],
    top: ((i * 17 + 5) % 100),
    left: ((i * 23 + 11) % 100),
    delay: i * 0.04,
    size: 20 + (i % 3) * 10,
    opacity: 0.08 + (i % 4) * 0.04,
    rotate: 30 + i * 15,
  };
}

export function TuhopLoader({ variant = "minimal" }: TuhopLoaderProps) {
  const shapes = useMemo(() => BG_SHAPES.map((_, i) => shapeAt(i)), []);
  const isFull = variant === "full";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.14 0.025 240)" }}
    >
      {/* ─── Background shapes (full only) ──────────────────── */}
      {isFull && (
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 20,
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "radial-gradient(circle at center, rgba(44,181,160,0.15) 0%, transparent 50%)",
              backgroundSize: "120vw 120vh",
            }}
          />

          <div className="absolute inset-0 opacity-20">
            {shapes.map((s, i) => {
              let shapeEl: React.ReactNode;
              if (s.type === "circle") {
                shapeEl = (
                  <div
                    className="rounded-full"
                    style={{
                      width: s.size,
                      height: s.size,
                      background: "rgba(44,181,160,0.3)",
                    }}
                  />
                );
              } else if (s.type === "square") {
                shapeEl = (
                  <div
                    style={{
                      width: s.size,
                      height: s.size,
                      background: "rgba(44,181,160,0.2)",
                      borderRadius: 4,
                    }}
                  />
                );
              } else {
                shapeEl = (
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: `${s.size / 2}px solid transparent`,
                      borderRight: `${s.size / 2}px solid transparent`,
                      borderBottom: `${s.size}px solid rgba(44,181,160,0.25)`,
                    }}
                  />
                );
              }

              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ top: `${s.top}%`, left: `${s.left}%` }}
                  initial={{ opacity: 0, scale: 0, rotate: s.rotate }}
                  animate={{
                    opacity: s.opacity,
                    scale: 1,
                    rotate: [s.rotate, s.rotate + 30, s.rotate],
                  }}
                  transition={{
                    delay: s.delay,
                    duration: 4 + (i % 3),
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                >
                  {shapeEl}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Logo ──────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative mb-6 flex items-center justify-center">
          {/* Pulsing glow (both variants) */}
          <motion.div
            className="absolute size-36 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(44,181,160,0.2) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Gradient ring (full only) */}
          {isFull && (
            <motion.div
              className="absolute size-32 rounded-full blur-md"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, rgba(44,181,160,0.15), transparent 60%, rgba(44,181,160,0.2), transparent)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}

          <motion.img
            src="/TUHOP-Logo.png"
            alt="TUHOP"
            draggable={false}
            className="relative z-10 size-24 select-none object-contain md:size-28"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* ─── Content below logo (full only) ──────────────── */}
        {isFull && (
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Staggered TUHOP text */}
            <div className="mb-6 flex overflow-hidden">
              {"TUHOP".split("").map((_char, i) => (
                <motion.span
                  key={i}
                  className="inline-block bg-gradient-to-r from-teal-300 to-teal-500 bg-clip-text font-sans-rounded text-3xl tracking-wider text-transparent md:text-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + i * 0.07,
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {"TUHOP"[i]}
                </motion.span>
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              className="relative h-1.5 w-56 overflow-hidden rounded-full bg-white/10 md:w-72"
              initial={{ opacity: 0, scaleX: 0.6 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-500/60 via-teal-400 to-teal-500/60"
                initial={{ width: "0%" }}
                animate={{ width: "100%", transition: { duration: 2.2, ease: "easeInOut" } }}
              />

              <motion.div
                className="absolute inset-y-0 w-16 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
                animate={{ left: ["-30%", "110%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
              />
            </motion.div>

            {/* Loading dots */}
            <div className="mt-6 flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="size-2 rounded-full bg-teal-400/60"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.9, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
