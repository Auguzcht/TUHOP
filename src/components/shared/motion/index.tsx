import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

import { MotionFade } from "./MotionFade"
import { MotionScale } from "./MotionScale"
import { MotionStagger, MotionStaggerItem } from "./MotionStagger"
import { motionPresets } from "./presets"

export * from "./presets"
export * from "./transitions"
export { MotionFade, MotionScale, MotionStagger, MotionStaggerItem }

export { MotionFade as FadeIn }
export { MotionScale as ScaleIn }

type MotionSlideProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  distance?: number
}

export function SlideUp({
  children,
  className,
  delay,
  duration,
  distance,
}: MotionSlideProps) {
  return (
    <motion.div
      className={className}
      {...motionPresets.slideUp({ delay, duration, distance })}
    >
      {children}
    </motion.div>
  )
}

export function SlideDown({
  children,
  className,
  delay,
  duration,
  distance,
}: MotionSlideProps) {
  return (
    <motion.div
      className={className}
      {...motionPresets.slideDown({ delay, duration, distance })}
    >
      {children}
    </motion.div>
  )
}

type PageTransitionProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function PageTransition({
  children,
  className,
  delay,
  duration,
}: PageTransitionProps) {
  return (
    <motion.div
      className={cn("animate-in-up", className)}
      {...motionPresets.pageTransition({ delay, duration })}
    >
      {children}
    </motion.div>
  )
}

type HoverLiftProps = {
  children: ReactNode
  className?: string
}

export function HoverLift({ children, className }: HoverLiftProps) {
  return (
    <motion.div className={cn("card-hover", className)} {...motionPresets.hoverLift}>
      {children}
    </motion.div>
  )
}

export function PulseDot({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-2", className)}>
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
      <span className="relative inline-flex size-2 rounded-full bg-accent" />
    </span>
  )
}
