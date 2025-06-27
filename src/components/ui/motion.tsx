'use client'

import { motion, AnimatePresence, useTransform, useScroll, MotionProps, Variants } from "framer-motion"
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

// Fade In Animation
const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Scale In Animation
const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

// Slide In From Left
const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Slide In From Right
const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Stagger Children Animation
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

// Hover Lift Animation
const hoverLiftVariants: Variants = {
  initial: { y: 0 },
  hover: { 
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Hover Scale Animation
const hoverScaleVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

// Floating Animation
const floatingVariants: Variants = {
  initial: { y: 0 },
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Pulse Animation
const pulseVariants: Variants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Reusable Motion Components
export const FadeIn = ({ children, delay = 0, ...props }: { children: ReactNode; delay?: number; [key: string]: any }) => (
  <motion.div
    variants={fadeInVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
)

export const ScaleIn = ({ children, delay = 0, ...props }: { children: ReactNode; delay?: number; [key: string]: any }) => (
  <motion.div
    variants={scaleInVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
)

export const SlideInLeft = ({ children, delay = 0, ...props }: { children: ReactNode; delay?: number; [key: string]: any }) => (
  <motion.div
    variants={slideInLeftVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
)

export const SlideInRight = ({ children, delay = 0, ...props }: { children: ReactNode; delay?: number; [key: string]: any }) => (
  <motion.div
    variants={slideInRightVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay }}
    {...props}
  >
    {children}
  </motion.div>
)

export const StaggerContainer = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <motion.div
    variants={staggerContainerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    {...props}
  >
    {children}
  </motion.div>
)

export const HoverLift = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <motion.div
    variants={hoverLiftVariants}
    initial="initial"
    whileHover="hover"
    {...props}
  >
    {children}
  </motion.div>
)

export const HoverScale = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <motion.div
    variants={hoverScaleVariants}
    initial="initial"
    whileHover="hover"
    {...props}
  >
    {children}
  </motion.div>
)

export const Floating = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <motion.div
    variants={floatingVariants}
    initial="initial"
    animate="float"
    {...props}
  >
    {children}
  </motion.div>
)

export const Pulse = ({ children, ...props }: { children: ReactNode; [key: string]: any }) => (
  <motion.div
    variants={pulseVariants}
    initial="initial"
    animate="pulse"
    {...props}
  >
    {children}
  </motion.div>
)

// Custom Animation Hooks
export const useScrollAnimation = (threshold = 0.1) => {
  return {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, threshold },
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export const useHoverAnimation = () => {
  return {
    whileHover: { 
      y: -8,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    whileTap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  }
}

export const useParallaxAnimation = (speed = 0.5) => {
  return {
    style: {
      y: useTransform(useScroll().scrollYProgress, [0, 1], [0, -100 * speed])
    }
  }
}

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
    viewport={{ once: true }}
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