'use client'

import { motion, AnimatePresence, useTransform, useScroll } from "framer-motion"
import { ReactNode, useState, useEffect } from "react"

// Common animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const slideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export const slideRight = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const scale = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Reusable motion components
interface MotionDivProps extends MotionProps {
  children: ReactNode
  className?: string
}

export const MotionDiv = ({ children, className, ...props }: MotionDivProps) => (
  <motion.div className={className} {...props}>
    {children}
  </motion.div>
)

export const MotionSection = ({ children, className, ...props }: MotionDivProps) => (
  <motion.section className={className} {...props}>
    {children}
  </motion.section>
)

export const MotionArticle = ({ children, className, ...props }: MotionDivProps) => (
  <motion.article className={className} {...props}>
    {children}
  </motion.article>
)

export const MotionHeader = ({ children, className, ...props }: MotionDivProps) => (
  <motion.header className={className} {...props}>
    {children}
  </motion.header>
)

export const MotionFooter = ({ children, className, ...props }: MotionDivProps) => (
  <motion.footer className={className} {...props}>
    {children}
  </motion.footer>
)

// Fade in animation
export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "" 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
)

// Slide up animation
export const SlideUp = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "" 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Scale in animation
export const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 0.6,
  className = "" 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Stagger children animation
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1,
  className = "" 
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Stagger item animation
export const StaggerItem = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Hover animations
export const HoverCard = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    whileHover={{ 
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Floating animation
export const Floating = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    animate={{ 
      y: [0, -10, 0],
      transition: { 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Pulse animation
export const Pulse = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    animate={{ 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Loading spinner animation
export const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className={`w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full ${className}`}
  />
)

// Scroll-triggered animations
export const ScrollReveal = ({ 
  children, 
  threshold = 0.1,
  className = "" 
}: { 
  children: ReactNode
  threshold?: number
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, threshold }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Page transition
export const PageTransition = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Button hover effect
export const AnimatedButton = ({ 
  children, 
  className = "",
  onClick
}: { 
  children: ReactNode
  className?: string
  onClick?: () => void
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.button>
)

// Card hover effect with 3D tilt
export const TiltCard = ({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    whileHover={{ 
      scale: 1.05,
      rotateY: 5,
      rotateX: 5
    }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
)

// AnimatedCard component
export const AnimatedCard = ({ 
  children, 
  className = "",
  delay = 0
}: { 
  children: ReactNode
  className?: string
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// AnimatedList component
export const AnimatedList = ({ 
  children, 
  className = "",
  staggerDelay = 0.1
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
}) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// AnimatedListItem component
export const AnimatedListItem = ({ 
  children, 
  className = ""
}: { 
  children: ReactNode
  className?: string
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Export AnimatePresence for conditional animations
export { AnimatePresence } 