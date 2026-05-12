export const motionDurations = {
  quick: 0.2,
  base: 0.3,
  slow: 0.45,
} as const

export const motionEasing = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
}

export const motionSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 32,
  mass: 0.9,
}
