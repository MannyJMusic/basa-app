'use client'

import React from 'react'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { EnhancedForm, FormField } from '@/components/ui/enhanced-form'
import { useAppStore, useUser, useUI, useEvents } from '@/lib/store'
import { PageTransition, AnimatedCard, AnimatedButton, AnimatedList, AnimatedListItem } from '@/components/ui/motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Calendar, 
  Settings, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Star,
  TrendingUp
} from 'lucide-react'

// Example form schema using Zod
const demoFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().min(1, 'Company is required'),
  role: z.enum(['owner', 'manager', 'employee']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  newsletter: z.boolean().transform(val => val ?? false),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms')
})

type DemoFormData = z.infer<typeof demoFormSchema>

// Example event data
const sampleEvents = [
  {
    id: '1',
    title: 'Networking Mixer',
    date: '2024-02-15',
    location: 'San Antonio Convention Center',
    price: 50,
    category: 'networking'
  },
  {
    id: '2',
    title: 'Business Workshop',
    date: '2024-02-20',
    location: 'Downtown Business Hub',
    price: 75,
    category: 'education'
  },
  {
    id: '3',
    title: 'Annual Gala',
    date: '2024-03-01',
    location: 'Grand Hotel',
    price: 150,
    category: 'social'
  }
]

export function TechStackDemo() {
  // Zustand store usage
  const { user, setUser, logout } = useUser()
  const { sidebarOpen, toggleSidebar, addNotification, theme, setTheme } = useUI()
  const { savedEvents, toggleSavedEvent, eventFilters, setEventFilters } = useEvents()

  // Form submission handler
  const handleFormSubmit = async (data: DemoFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add notification using Zustand
    addNotification({
      type: 'success',
      title: 'Form Submitted!',
      message: `Thank you ${data.name}, your message has been received.`,
      duration: 5000
    })

    console.log('Form data:', data)
  }

  // Auto-save handler
  const handleAutoSave = async (data: DemoFormData) => {
    console.log('Auto-saving:', data)
    // Simulate auto-save API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Demo user login
  const handleDemoLogin = () => {
    setUser({
      id: 'demo-1',
      email: 'demo@basa.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'member',
      isVerified: true
    })
  }

  // Toggle event save
  const handleToggleEvent = (eventId: string) => {
    toggleSavedEvent(eventId)
    addNotification({
      type: 'info',
      title: 'Event Updated',
      message: savedEvents.includes(eventId) 
        ? 'Event removed from saved list' 
        : 'Event added to saved list',
      duration: 3000
    })
  }

  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            BASA Technology Stack Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, 
            React Hook Form, Zod, and Zustand integration
          </p>
        </motion.div>

        {/* Tech Stack Overview */}
        <AnimatedCard className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 14', icon: '⚡', color: 'bg-black text-white' },
              { name: 'TypeScript', icon: '🔷', color: 'bg-blue-600 text-white' },
              { name: 'Tailwind CSS', icon: '🎨', color: 'bg-cyan-500 text-white' },
              { name: 'shadcn/ui', icon: '🧩', color: 'bg-gray-800 text-white' },
              { name: 'Framer Motion', icon: '✨', color: 'bg-purple-600 text-white' },
              { name: 'React Hook Form', icon: '📝', color: 'bg-red-500 text-white' },
              { name: 'Zod', icon: '🛡️', color: 'bg-green-600 text-white' },
              { name: 'Zustand', icon: '📦', color: 'bg-orange-500 text-white' }
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${tech.color} p-4 rounded-lg text-center`}
              >
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div className="text-sm font-medium">{tech.name}</div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Zustand State Management Demo */}
          <AnimatedCard className="bg-white shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Zustand State Management
              </CardTitle>
              <CardDescription>
                Global state management with persistence and selectors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User State */}
              <div className="space-y-2">
                <h4 className="font-medium">User State</h4>
                {user ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Logged in:</strong> {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {user.role}
                    </Badge>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Not logged in</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button onClick={handleDemoLogin} size="sm">
                    Demo Login
                  </Button>
                  <Button onClick={logout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </div>

              <Separator />

              {/* UI State */}
              <div className="space-y-2">
                <h4 className="font-medium">UI State</h4>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleSidebar}
                    variant="outline"
                    size="sm"
                  >
                    {sidebarOpen ? 'Close' : 'Open'} Sidebar
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Theme:</span>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as any)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Event State */}
              <div className="space-y-2">
                <h4 className="font-medium">Event State</h4>
                <p className="text-sm text-gray-600">
                  Saved events: {savedEvents.length}
                </p>
                <div className="space-y-2">
                  {sampleEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">{event.title}</span>
                      <Button
                        onClick={() => handleToggleEvent(event.id)}
                        variant={savedEvents.includes(event.id) ? "default" : "outline"}
                        size="sm"
                      >
                        {savedEvents.includes(event.id) ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Enhanced Form Demo */}
          <AnimatedCard className="bg-white shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Enhanced Form with Validation
              </CardTitle>
              <CardDescription>
                React Hook Form + Zod + Framer Motion integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedForm
                schema={demoFormSchema}
                onSubmit={handleFormSubmit}
                onAutoSave={handleAutoSave}
                autoSave={true}
                autoSaveDelay={3000}
                showReset={true}
                submitText="Submit Form"
                loadingText="Submitting..."
                resetText="Reset Form"
              >
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                />
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="company"
                  label="Company"
                  placeholder="Enter your company name"
                  required
                />
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="role"
                  label="Role"
                  type="select"
                  options={[
                    { value: 'owner', label: 'Business Owner' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'employee', label: 'Employee' }
                  ]}
                  required
                />
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="message"
                  label="Message"
                  type="textarea"
                  placeholder="Tell us about your business needs..."
                  rows={4}
                  required
                />
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="newsletter"
                  label="Subscribe to Newsletter"
                  type="checkbox"
                />
                {/* @ts-expect-error control is injected by EnhancedForm */}
                <FormField
                  name="terms"
                  label="I accept the terms and conditions"
                  type="checkbox"
                  required
                />
              </EnhancedForm>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Framer Motion Animations Demo */}
        <AnimatedCard className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6">Framer Motion Animations</h2>
          
          <AnimatedList className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Staggered Animation',
                description: 'Items animate in sequence',
                icon: TrendingUp,
                color: 'bg-blue-500'
              },
              {
                title: 'Hover Effects',
                description: 'Interactive hover animations',
                icon: Star,
                color: 'bg-purple-500'
              },
              {
                title: 'Page Transitions',
                description: 'Smooth page transitions',
                icon: ArrowRight,
                color: 'bg-green-500'
              }
            ].map((item, index) => (
              <AnimatedListItem key={item.title}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    rotate: 2,
                    transition: { duration: 0.2 }
                  }}
                  className={`${item.color} text-white p-6 rounded-lg cursor-pointer`}
                >
                  <item.icon className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.description}</p>
                </motion.div>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </AnimatedCard>

        {/* Notification Demo */}
        <AnimatedCard className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Notification System</h2>
          <div className="flex gap-4">
            <AnimatedButton
              onClick={() => addNotification({
                type: 'success',
                title: 'Success!',
                message: 'This is a success notification',
                duration: 5000
              })}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Show Success
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => addNotification({
                type: 'error',
                title: 'Error!',
                message: 'This is an error notification',
                duration: 5000
              })}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Show Error
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => addNotification({
                type: 'warning',
                title: 'Warning!',
                message: 'This is a warning notification',
                duration: 5000
              })}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Show Warning
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => addNotification({
                type: 'info',
                title: 'Info!',
                message: 'This is an info notification',
                duration: 5000
              })}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Show Info
            </AnimatedButton>
          </div>
        </AnimatedCard>
      </div>
    </PageTransition>
  )
} 