// Shared framer-motion presets. Spread them onto a motion element:
//   <motion.div {...PAGE_ENTER}>

// Detail pages fade up slightly when they mount.
export const PAGE_ENTER = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
}
