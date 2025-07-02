'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  Mail, 
  Database, 
  Code, 
  Eye,
  EyeOff,
  Zap,
  Bug,
  Terminal,
  GripVertical,
  PanelLeft
} from 'lucide-react'
import { DevNotifications } from '@/components/ui/dev-notifications'
import { DevEmailLogger } from '@/components/ui/dev-email-logger'
import { DevBanner } from '@/components/ui/dev-banner'

interface DevControlPanelProps {
  children: React.ReactNode
  paymentData?: any
  emailStatus?: any
  className?: string
}

export function DevControlPanel({ 
  children, 
  paymentData, 
  emailStatus,
  className = '' 
}: DevControlPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false) // Hidden by default
  const [panelHeight, setPanelHeight] = useState(48) // 48px = 3rem (collapsed)
  const [isResizing, setIsResizing] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const startHeightRef = useRef<number>(48)

  // Handle mouse/touch events for resizing
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    startYRef.current = clientY
    startHeightRef.current = panelHeight
  }

  const handleResizeMove = (e: MouseEvent | TouchEvent) => {
    if (!isResizing) return
    
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const deltaY = clientY - startYRef.current // Fixed: positive delta expands downward
    const newHeight = Math.max(48, Math.min(600, startHeightRef.current + deltaY))
    setPanelHeight(newHeight)
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
  }

  // Add/remove event listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      document.addEventListener('touchmove', handleResizeMove)
      document.addEventListener('touchend', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
        document.removeEventListener('touchmove', handleResizeMove)
        document.removeEventListener('touchend', handleResizeEnd)
      }
    }
  }, [isResizing, panelHeight])

  // Update expanded state based on height
  useEffect(() => {
    setIsExpanded(panelHeight > 60)
  }, [panelHeight])

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Content - no padding top since panel overlays */}
      <div>
        {children}
      </div>

      {/* Floating Toggle Button - Always visible when panel is hidden */}
      {!isVisible && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            onClick={() => setIsVisible(true)}
            size="lg"
            variant="default"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg border-2 border-primary/20 backdrop-blur-sm"
          >
            <PanelLeft className="h-5 w-5 mr-2" />
            <span className="font-semibold">Dev Panel</span>
            <Badge variant="secondary" className="ml-2 text-xs bg-primary-foreground text-primary">
              DEV
            </Badge>
          </Button>
        </div>
      )}

      {/* Overlay Dev Panel at Top */}
      {isVisible && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-2xl"
          style={{ 
            height: `${panelHeight}px`,
            transition: isResizing ? 'none' : 'height 0.2s ease-in-out'
          }}
        >
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50 h-12">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Developer Control Panel</span>
                <Badge variant="secondary" className="text-xs">DEV</Badge>
              </div>
              
              {/* Quick Status Indicators */}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {paymentData && (
                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-green-500" />
                    <span>Payment Ready</span>
                  </div>
                )}
                {emailStatus && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3 text-blue-500" />
                    <span>Email Active</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Toggle Visibility */}
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                title="Hide Dev Panel"
              >
                <EyeOff className="h-4 w-4" />
              </Button>

              {/* Quick Height Presets */}
              <Button
                onClick={() => setPanelHeight(48)}
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
              >
                Min
              </Button>
              <Button
                onClick={() => setPanelHeight(200)}
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
              >
                Med
              </Button>
              <Button
                onClick={() => setPanelHeight(400)}
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
              >
                Max
              </Button>
            </div>
          </div>

          {/* Resize Handle */}
          <div 
            ref={resizeRef}
            className="absolute bottom-0 left-0 right-0 h-1 bg-border cursor-ns-resize hover:bg-primary/20 transition-colors"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <div className="flex items-center justify-center h-full">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="h-full overflow-hidden" style={{ height: `calc(100% - 48px)` }}>
              <Tabs defaultValue="notifications" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-4 h-10">
                  <TabsTrigger value="notifications" className="flex items-center space-x-2">
                    <Bug className="h-3 w-3" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span className="hidden sm:inline">Email Logger</span>
                  </TabsTrigger>
                  <TabsTrigger value="database" className="flex items-center space-x-2">
                    <Database className="h-3 w-3" />
                    <span className="hidden sm:inline">Database</span>
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="flex items-center space-x-2">
                    <Settings className="h-3 w-3" />
                    <span className="hidden sm:inline">Tools</span>
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto p-4" style={{ height: `calc(100% - 40px)` }}>
                  <TabsContent value="notifications" className="h-full m-0">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Payment & Email Notifications</CardTitle>
                      </CardHeader>
                      <CardContent className="h-full overflow-auto">
                        <DevNotifications 
                          paymentId={paymentData?.paymentId}
                          customerEmail={paymentData?.customerEmail}
                          customerName={paymentData?.customerName}
                          membershipType={paymentData?.membershipType}
                          totalAmount={paymentData?.totalAmount}
                          additionalMembers={paymentData?.additionalMembers}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="email" className="h-full m-0">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Email System Logger</CardTitle>
                      </CardHeader>
                      <CardContent className="h-full overflow-auto">
                        <DevEmailLogger />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="database" className="h-full m-0">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Database Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="h-full overflow-auto">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Quick Actions</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Database className="h-3 w-3 mr-2" />
                                  Test Database Connection
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Code className="h-3 w-3 mr-2" />
                                  View Schema
                                </Button>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">User Management</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Terminal className="h-3 w-3 mr-2" />
                                  Create Test User
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Eye className="h-3 w-3 mr-2" />
                                  View All Users
                                </Button>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="tools" className="h-full m-0">
                    <Card className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Development Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="h-full overflow-auto">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Email Testing</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Mail className="h-3 w-3 mr-2" />
                                  Test Welcome Email
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Mail className="h-3 w-3 mr-2" />
                                  Test Receipt Email
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Mail className="h-3 w-3 mr-2" />
                                  Test Event Email
                                </Button>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Payment Testing</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Zap className="h-3 w-3 mr-2" />
                                  Trigger Webhook
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-start">
                                  <Bug className="h-3 w-3 mr-2" />
                                  Test Payment Flow
                                </Button>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Environment Info</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Environment:</span>
                                  <Badge variant="outline" className="ml-2">
                                    {process.env.NODE_ENV}
                                  </Badge>
                                </div>
                                <div>
                                  <span className="font-medium">Email System:</span>
                                  <Badge variant="outline" className="ml-2">
                                    Active
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 