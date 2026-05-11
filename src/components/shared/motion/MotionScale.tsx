import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { motionPresets } from "./presets"

type MotionScaleProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function MotionScale({
  children,
  className,
  delay,
  duration,
}: MotionScaleProps) {
  return (
    <motion.div
      className={className}
      {...motionPresets.scaleIn({ delay, duration })}
    >
      {children}
    </motion.div>
  )
}
