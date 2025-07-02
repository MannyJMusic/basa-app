"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Loading, 
  PageLoading, 
  InlineLoading, 
  StatusLoading, 
  ButtonLoading,
  BasaLoading,
  BasaEventLoading,
  BasaMemberLoading,
  BasaNetworkLoading,
  DashboardLoading,
  DashboardTableLoading,
  DashboardCardLoading,
  DashboardFormLoading,
  DashboardProfileLoading,
  DashboardSettingsLoading,
  Skeleton,
  CardSkeleton,
  EventCardSkeleton,
  MemberCardSkeleton,
  TableSkeleton,
  FormSkeleton
} from "@/components/ui/loading-system"

export default function LoadingDemoPage() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [progress, setProgress] = useState(0)

  const toggleLoading = (key: string) => {
    setLoadingStates(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">BASA Loading Components</h1>
          <p className="text-xl text-gray-600">A comprehensive collection of loading states and animations</p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Loading</TabsTrigger>
            <TabsTrigger value="basa">BASA Branded</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
          </TabsList>

          {/* Basic Loading Components */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loading Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Loading Types</CardTitle>
                  <CardDescription>Different animation styles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Spinner</span>
                    <Loading type="spinner" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dots</span>
                    <Loading type="dots" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pulse</span>
                    <Loading type="pulse" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Bars</span>
                    <Loading type="bars" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ring</span>
                    <Loading type="ring" size="sm" />
                  </div>
                </CardContent>
              </Card>

              {/* Loading Sizes */}
              <Card>
                <CardHeader>
                  <CardTitle>Loading Sizes</CardTitle>
                  <CardDescription>Different size options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Small</span>
                    <Loading type="spinner" size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium</span>
                    <Loading type="spinner" size="md" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Large</span>
                    <Loading type="spinner" size="lg" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Extra Large</span>
                    <Loading type="spinner" size="xl" />
                  </div>
                </CardContent>
              </Card>

              {/* Status Loading */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Loading</CardTitle>
                  <CardDescription>Different status states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StatusLoading status="loading" text="Loading..." />
                  <StatusLoading status="success" text="Success!" />
                  <StatusLoading status="error" text="Error occurred" />
                  <StatusLoading status="pending" text="Pending..." />
                </CardContent>
              </Card>

              {/* Interactive Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Examples</CardTitle>
                  <CardDescription>Click to toggle loading states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => toggleLoading('inline')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates.inline ? (
                      <InlineLoading text="Processing..." />
                    ) : (
                      "Toggle Inline Loading"
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => toggleLoading('button')}
                    className="w-full"
                  >
                    {loadingStates.button ? (
                      <ButtonLoading text="Loading..." />
                    ) : (
                      "Toggle Button Loading"
                    )}
                  </Button>

                  <Button 
                    onClick={simulateProgress}
                    variant="outline"
                    className="w-full"
                  >
                    Simulate Progress
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Page Loading Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Page Loading</CardTitle>
                <CardDescription>Full page loading experience</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => toggleLoading('page')}
                  className="w-full"
                >
                  {loadingStates.page ? "Hide" : "Show"} Page Loading
                </Button>
                {loadingStates.page && (
                  <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                    <PageLoading 
                      text="Loading BASA..." 
                      showProgress={true}
                      progress={progress}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BASA Branded Loading */}
          <TabsContent value="basa" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>BASA Full Loading</CardTitle>
                  <CardDescription>Complete branded experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => toggleLoading('basa-full')}
                    className="w-full"
                  >
                    {loadingStates['basa-full'] ? "Hide" : "Show"} BASA Loading
                  </Button>
                  {loadingStates['basa-full'] && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                      <BasaLoading 
                        type="full"
                        showFeatures={true}
                        showProgress={true}
                        progress={progress}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specialized Loading</CardTitle>
                  <CardDescription>Context-specific loading states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => toggleLoading('basa-events')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates['basa-events'] ? "Hide" : "Show"} Events Loading
                  </Button>
                  
                  <Button 
                    onClick={() => toggleLoading('basa-members')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates['basa-members'] ? "Hide" : "Show"} Members Loading
                  </Button>
                  
                  <Button 
                    onClick={() => toggleLoading('basa-network')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates['basa-network'] ? "Hide" : "Show"} Network Loading
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Show specialized loading states */}
            {loadingStates['basa-events'] && (
              <Card>
                <CardContent className="p-6">
                  <BasaEventLoading />
                </CardContent>
              </Card>
            )}
            
            {loadingStates['basa-members'] && (
              <Card>
                <CardContent className="p-6">
                  <BasaMemberLoading />
                </CardContent>
              </Card>
            )}
            
            {loadingStates['basa-network'] && (
              <Card>
                <CardContent className="p-6">
                  <BasaNetworkLoading />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Dashboard Loading */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Loading</CardTitle>
                  <CardDescription>General dashboard skeleton</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => toggleLoading('dashboard')}
                    className="w-full"
                  >
                    {loadingStates.dashboard ? "Hide" : "Show"} Dashboard Loading
                  </Button>
                  {loadingStates.dashboard && (
                    <div className="mt-4">
                      <DashboardLoading />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Components</CardTitle>
                  <CardDescription>Specific dashboard loading states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => toggleLoading('dashboard-table')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates['dashboard-table'] ? "Hide" : "Show"} Table Loading
                  </Button>
                  
                  <Button 
                    onClick={() => toggleLoading('dashboard-cards')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates['dashboard-cards'] ? "Hide" : "Show"} Cards Loading
                  </Button>
                  
                  <Button 
                    onClick={() => toggleLoading('dashboard-form')}
                    variant="outline"
                    className="w-full"
                  >
                    {loadingStates['dashboard-form'] ? "Hide" : "Show"} Form Loading
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Show dashboard loading states */}
            {loadingStates['dashboard-table'] && (
              <Card>
                <CardContent className="p-6">
                  <DashboardTableLoading />
                </CardContent>
              </Card>
            )}
            
            {loadingStates['dashboard-cards'] && (
              <Card>
                <CardContent className="p-6">
                  <DashboardCardLoading />
                </CardContent>
              </Card>
            )}
            
            {loadingStates['dashboard-form'] && (
              <Card>
                <CardContent className="p-6">
                  <DashboardFormLoading />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skeleton Components */}
          <TabsContent value="skeletons" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Skeleton</CardTitle>
                  <CardDescription>Simple skeleton element</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Card Skeleton</CardTitle>
                  <CardDescription>Skeleton for card components</CardDescription>
                </CardHeader>
                <CardContent>
                  <CardSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Event Card Skeleton</CardTitle>
                  <CardDescription>Skeleton for event cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <EventCardSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Member Card Skeleton</CardTitle>
                  <CardDescription>Skeleton for member cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <MemberCardSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form Skeleton</CardTitle>
                  <CardDescription>Skeleton for forms</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Table Skeleton</CardTitle>
                  <CardDescription>Skeleton for data tables</CardDescription>
                </CardHeader>
                <CardContent>
                  <TableSkeleton />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 