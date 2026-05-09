import type { ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

/* ============================================================
   TUHOP Motion Primitives
   Reusable animation wrappers for consistent motion language.
   All durations in sync with CSS animation tokens (index.css).
   ============================================================ */

// ─── Fade In ────────────────────────────────────────────────

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
};

export function FadeIn({ children, className, delay = 0, duration = 0.3 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Fade In + Slide Up ─────────────────────────────────────

type SlideUpProps = FadeInProps & {
  distance?: number;
};

export function SlideUp({
  children,
  className,
  delay = 0,
  duration = 0.35,
  distance = 12,
}: SlideUpProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Fade In + Slide Down ───────────────────────────────────

export function SlideDown({ children, className, delay = 0, duration = 0.35 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Scale In ────────────────────────────────────────────────

export function ScaleIn({ children, className, delay = 0, duration = 0.2 }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Container (for lists) ──────────────────────────

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
};

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
  once = true,
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.05,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      viewport={{ once }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Item (child of StaggerContainer) ───────────────

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// ─── Page Transition Wrapper ─────────────────────────────────

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      className={cn("animate-in-up", className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Card Hover Lift ────────────────────────────────────────

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
};

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <motion.div
      className={cn("card-hover", className)}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Badge Pulse ────────────────────────────────────────────

export function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-accent" />
    </span>
  );
}
