import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { motionPresets } from "./presets"

type MotionFadeProps = {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function MotionFade({
  children,
  className,
  delay,
  duration,
}: MotionFadeProps) {
  return (
    <motion.div
      className={className}
      {...motionPresets.fadeIn({ delay, duration })}
    >
      {children}
    </motion.div>
  )
}
