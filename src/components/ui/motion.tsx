'use client'

import { motion, AnimatePresence, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'

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

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={className}
  >
    {children}
  </motion.div>
)

// Card animation wrapper
interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  index?: number
}

export const AnimatedCard = ({ children, className, delay = 0, index = 0 }: AnimatedCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ 
      duration: 0.4, 
      delay: delay + (index * 0.1),
      ease: "easeOut"
    }}
    whileHover={{ 
      y: -5, 
      scale: 1.02,
      transition: { duration: 0.2 }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

// Button animation wrapper
interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const AnimatedButton = ({ children, className, onClick, disabled }: AnimatedButtonProps) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    transition={{ duration: 0.1 }}
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </motion.button>
)

// List animation wrapper
interface AnimatedListProps {
  children: ReactNode
  className?: string
}

export const AnimatedList = ({ children, className }: AnimatedListProps) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
)

// List item animation wrapper
interface AnimatedListItemProps {
  children: ReactNode
  className?: string
}

export const AnimatedListItem = ({ children, className }: AnimatedListItemProps) => (
  <motion.div
    variants={staggerItem}
    className={className}
  >
    {children}
  </motion.div>
)

// Modal animation wrapper
interface AnimatedModalProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const AnimatedModal = ({ children, isOpen, onClose, className }: AnimatedModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${className}`}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

// Notification animation wrapper
interface AnimatedNotificationProps {
  children: ReactNode
  isVisible: boolean
  onClose: () => void
  className?: string
}

export const AnimatedNotification = ({ children, isVisible, onClose, className }: AnimatedNotificationProps) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
)

// Loading spinner animation
export const LoadingSpinner = ({ className = "" }: { className?: string }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className={`w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full ${className}`}
  />
)

// Progress bar animation
interface AnimatedProgressBarProps {
  progress: number
  className?: string
}

export const AnimatedProgressBar = ({ progress, className }: AnimatedProgressBarProps) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <motion.div
      className="bg-blue-600 h-2 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  </div>
) 