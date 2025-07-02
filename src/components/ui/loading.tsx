"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface LoadingProps {
  type?: "spinner" | "dots" | "pulse" | "bars" | "ring"
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  className?: string
  showIcon?: boolean
}

export function Loading({ 
  type = "spinner", 
  size = "md", 
  text, 
  className,
  showIcon = true 
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  }

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  }

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        "border-2 border-gray-300 border-t-blue-600 rounded-full",
        sizeClasses[size]
      )}
    />
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2
          }}
          className={cn(
            "bg-blue-600 rounded-full",
            size === "sm" ? "w-1.5 h-1.5" : 
            size === "md" ? "w-2 h-2" :
            size === "lg" ? "w-2.5 h-2.5" : "w-3 h-3"
          )}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{ 
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn(
        "bg-blue-600 rounded-full",
        sizeClasses[size]
      )}
    />
  )

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ 
            height: ["20%", "100%", "20%"]
          }}
          transition={{ 
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.1
          }}
          className={cn(
            "bg-blue-600 rounded-sm",
            size === "sm" ? "w-1" : 
            size === "md" ? "w-1.5" :
            size === "lg" ? "w-2" : "w-2.5",
            size === "sm" ? "h-4" : 
            size === "md" ? "h-6" :
            size === "lg" ? "h-8" : "h-12"
          )}
        />
      ))}
    </div>
  )

  const renderRing = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={cn(
        "border-4 border-gray-200 border-t-blue-600 border-r-blue-600 rounded-full",
        sizeClasses[size]
      )}
    />
  )

  const renderLoader = () => {
    switch (type) {
      case "dots":
        return renderDots()
      case "pulse":
        return renderPulse()
      case "bars":
        return renderBars()
      case "ring":
        return renderRing()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      {showIcon && (
        <div className="mb-3">
          {renderLoader()}
        </div>
      )}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "text-gray-600 dark:text-gray-400 text-center",
            textSizes[size]
          )}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Full page loading component
interface PageLoadingProps {
  text?: string
  showProgress?: boolean
  progress?: number
}

export function PageLoading({ 
  text = "Loading...", 
  showProgress = false,
  progress = 0 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mx-auto"
        >
          <Loading type="ring" size="xl" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl font-semibold text-gray-900 dark:text-white"
        >
          {text}
        </motion.h2>

        {showProgress && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-64 mx-auto"
          >
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: 0.6 }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {progress}% complete
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Inline loading component
interface InlineLoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function InlineLoading({ text, size = "sm" }: InlineLoadingProps) {
  return (
    <div className="flex items-center space-x-2">
      <Loading type="spinner" size={size} showIcon={true} />
      {text && (
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {text}
        </span>
      )}
    </div>
  )
}

// Status loading components
interface StatusLoadingProps {
  status: "loading" | "success" | "error" | "pending"
  text?: string
  size?: "sm" | "md" | "lg"
}

export function StatusLoading({ status, text, size = "md" }: StatusLoadingProps) {
  const statusConfig = {
    loading: {
      icon: Loader2,
      color: "text-blue-600",
      animation: "animate-spin"
    },
    success: {
      icon: CheckCircle,
      color: "text-green-600",
      animation: ""
    },
    error: {
      icon: AlertCircle,
      color: "text-red-600",
      animation: ""
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      animation: "animate-pulse"
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="flex items-center space-x-2">
      <Icon className={cn(
        size === "sm" ? "w-4 h-4" : 
        size === "md" ? "w-5 h-5" : "w-6 h-6",
        config.color,
        config.animation
      )} />
      {text && (
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {text}
        </span>
      )}
    </div>
  )
}

// Button loading component
interface ButtonLoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function ButtonLoading({ text = "Loading...", size = "sm" }: ButtonLoadingProps) {
  return (
    <div className="flex items-center space-x-2">
      <Loading type="spinner" size={size} showIcon={true} />
      <span>{text}</span>
    </div>
  )
} 