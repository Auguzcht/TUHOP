import type { Variants } from "framer-motion"

import { motionDurations, motionEasing, motionSpring } from "./transitions"

type FadeOptions = {
  delay?: number
  duration?: number
}

type SlideOptions = FadeOptions & {
  distance?: number
}

type StaggerOptions = {
  staggerDelay?: number
  delayChildren?: number
}

export const motionPresets = {
  fadeIn: (options: FadeOptions = {}) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: options.duration ?? motionDurations.base,
      delay: options.delay ?? 0,
      ease: motionEasing.out,
    },
  }),
  slideUp: (options: SlideOptions = {}) => ({
    initial: { opacity: 0, y: options.distance ?? 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: options.duration ?? motionDurations.base,
      delay: options.delay ?? 0,
      ease: motionEasing.out,
    },
  }),
  slideDown: (options: SlideOptions = {}) => ({
    initial: { opacity: 0, y: -(options.distance ?? 12) },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: options.duration ?? motionDurations.base,
      delay: options.delay ?? 0,
      ease: motionEasing.out,
    },
  }),
  scaleIn: (options: FadeOptions = {}) => ({
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: options.duration ?? motionDurations.quick,
      delay: options.delay ?? 0,
      ease: motionEasing.out,
    },
  }),
  pressable: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },
  hoverLift: {
    whileHover: {
      y: -2,
      boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
    },
    transition: motionSpring,
  },
  pageTransition: (options: FadeOptions = {}) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
    transition: {
      duration: options.duration ?? motionDurations.base,
      delay: options.delay ?? 0,
      ease: motionEasing.out,
    },
  }),
  staggerContainer: (options: StaggerOptions = {}) => {
    const containerVariants: Variants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: options.staggerDelay ?? 0.06,
          delayChildren: options.delayChildren ?? 0.05,
        },
      },
    }

    return {
      variants: containerVariants,
      initial: "hidden",
      animate: "visible",
    }
  },
  staggerItem: (options: FadeOptions & { distance?: number } = {}) => {
    const itemVariants: Variants = {
      hidden: { opacity: 0, y: options.distance ?? 12 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: options.duration ?? motionDurations.base,
          ease: motionEasing.out,
        },
      },
    }

    return { variants: itemVariants }
  },
}
