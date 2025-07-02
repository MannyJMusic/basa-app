"use client"

import { motion } from "framer-motion"
import { Building2, Users, Calendar, Award, Globe, Handshake } from "lucide-react"
import { Loading } from "./loading"

interface BasaLoadingProps {
  type?: "full" | "inline" | "minimal"
  text?: string
  showFeatures?: boolean
  showProgress?: boolean
  progress?: number
}

const features = [
  { icon: Building2, text: "Business Networking", delay: 0.1 },
  { icon: Users, text: "Member Directory", delay: 0.2 },
  { icon: Calendar, text: "Event Management", delay: 0.3 },
  { icon: Award, text: "Professional Growth", delay: 0.4 },
  { icon: Globe, text: "Global Connections", delay: 0.5 },
  { icon: Handshake, text: "Partnerships", delay: 0.6 }
]

export function BasaLoading({ 
  type = "full", 
  text = "Welcome to BASA",
  showFeatures = true,
  showProgress = false,
  progress = 0 
}: BasaLoadingProps) {
  if (type === "minimal") {
    return (
      <div className="flex items-center justify-center p-4">
        <Loading type="ring" size="md" text={text} />
      </div>
    )
  }

  if (type === "inline") {
    return (
      <div className="flex items-center space-x-3 p-4">
        <Loading type="spinner" size="sm" />
        <span className="text-gray-600 dark:text-gray-400">{text}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center space-y-8 max-w-2xl mx-auto px-6">
        {/* Logo/Brand Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            BASA
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 dark:text-gray-300 font-medium"
          >
            {text}
          </motion.p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex justify-center"
        >
          <Loading type="ring" size="xl" />
        </motion.div>

        {/* Progress Bar */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-blue-800 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {progress}% complete
            </p>
          </motion.div>
        )}

        {/* Features Grid */}
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  delay: feature.delay + 0.8, 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200
                }}
                className="flex flex-col items-center space-y-2 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
              >
                <feature.icon className="w-6 h-6 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connecting you to the BASA community...
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Specialized loading components for different sections
export function BasaEventLoading() {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center"
      >
        <Calendar className="w-8 h-8 text-blue-600" />
      </motion.div>
      <Loading type="dots" size="lg" text="Loading events..." />
    </div>
  )
}

export function BasaMemberLoading() {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
      >
        <Users className="w-8 h-8 text-green-600" />
      </motion.div>
      <Loading type="pulse" size="lg" text="Loading members..." />
    </div>
  )
}

export function BasaNetworkLoading() {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center"
      >
        <Handshake className="w-8 h-8 text-purple-600" />
      </motion.div>
      <Loading type="bars" size="lg" text="Building connections..." />
    </div>
  )
} 