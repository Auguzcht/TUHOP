import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { motionPresets } from "./presets"

type MotionStaggerProps = {
  children: ReactNode
  className?: string
  staggerDelay?: number
  delayChildren?: number
  once?: boolean
}

type MotionStaggerItemProps = {
  children: ReactNode
  className?: string
  duration?: number
  distance?: number
}

export function MotionStagger({
  children,
  className,
  staggerDelay,
  delayChildren,
  once = true,
}: MotionStaggerProps) {
  return (
    <motion.div
      className={className}
      {...motionPresets.staggerContainer({ staggerDelay, delayChildren })}
      viewport={{ once }}
    >
      {children}
    </motion.div>
  )
}

export function MotionStaggerItem({
  children,
  className,
  duration,
  distance,
}: MotionStaggerItemProps) {
  return (
    <motion.div
      className={className}
      {...motionPresets.staggerItem({ duration, distance })}
    >
      {children}
    </motion.div>
  )
}
