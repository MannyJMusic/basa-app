"use client"

import { useState, useEffect } from 'react'
import { useSettings, Settings } from '@/hooks/use-settings'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, Users, Shield, Bell, Database, Globe, Mail, Loader2 } from "lucide-react"
import { AdminUsersManager } from './admin-users-manager'

export function SettingsForm() {
  const { settings, loading, error, saving, updateSettings, resetSettings } = useSettings()
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<Settings>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  // Check for changes
  useEffect(() => {
    if (settings && formData) {
      const changed = Object.keys(formData).some(key => {
        const k = key as keyof Settings
        return formData[k] !== settings[k]
      })
      setHasChanges(changed)
    }
  }, [formData, settings])

  const handleInputChange = (field: keyof Settings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      await updateSettings(formData)
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReset = async () => {
    try {
      await resetSettings()
      toast({
        title: "Settings reset",
        description: "Settings have been reset to defaults.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading settings: {error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">Manage system configuration and organization settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input 
                    id="org-name" 
                    value={formData.organizationName || ''}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Contact Email</Label>
                  <Input 
                    id="org-email" 
                    type="email" 
                    value={formData.contactEmail || ''}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone Number</Label>
                  <Input 
                    id="org-phone" 
                    value={formData.phoneNumber || ''}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-website">Website</Label>
                  <Input 
                    id="org-website" 
                    value={formData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">Address</Label>
                <Input 
                  id="org-address" 
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-description">Description</Label>
                <textarea 
                  id="org-description" 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">Temporarily disable the website for maintenance</p>
                </div>
                <Switch 
                  checked={formData.maintenanceMode || false}
                  onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-approve Members</Label>
                  <p className="text-sm text-gray-500">Automatically approve new member registrations</p>
                </div>
                <Switch 
                  checked={formData.autoApproveMembers || false}
                  onCheckedChange={(checked) => handleInputChange('autoApproveMembers', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email notifications for admin actions</p>
                </div>
                <Switch 
                  checked={formData.emailNotifications || false}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <AdminUsersManager />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                </div>
                <Switch 
                  checked={formData.requireTwoFactor || false}
                  onCheckedChange={(checked) => handleInputChange('requireTwoFactor', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                </div>
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.sessionTimeout || 30}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Password Policy</Label>
                  <p className="text-sm text-gray-500">Enforce strong password requirements</p>
                </div>
                <Switch 
                  checked={formData.enforcePasswordPolicy || false}
                  onCheckedChange={(checked) => handleInputChange('enforcePasswordPolicy', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Allowed IP Addresses</Label>
                <Input 
                  placeholder="192.168.1.0/24, 10.0.0.0/8" 
                  value={formData.allowedIpAddresses || ''}
                  onChange={(e) => handleInputChange('allowedIpAddresses', e.target.value)}
                />
                <p className="text-sm text-gray-500">Leave empty to allow all IPs</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>API Rate Limiting</Label>
                  <p className="text-sm text-gray-500">Limit API requests per minute</p>
                </div>
                <Input 
                  type="number" 
                  value={formData.apiRateLimit || 100}
                  onChange={(e) => handleInputChange('apiRateLimit', parseInt(e.target.value))}
                  className="w-24" 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>New Member Registrations</Label>
                  <p className="text-sm text-gray-500">Notify when new members join</p>
                </div>
                <Switch 
                  checked={formData.notifyNewMembers || false}
                  onCheckedChange={(checked) => handleInputChange('notifyNewMembers', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Payment Notifications</Label>
                  <p className="text-sm text-gray-500">Notify of successful payments</p>
                </div>
                <Switch 
                  checked={formData.notifyPayments || false}
                  onCheckedChange={(checked) => handleInputChange('notifyPayments', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Event Registrations</Label>
                  <p className="text-sm text-gray-500">Notify of new event registrations</p>
                </div>
                <Switch 
                  checked={formData.notifyEventRegistrations || false}
                  onCheckedChange={(checked) => handleInputChange('notifyEventRegistrations', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-sm text-gray-500">Notify of system issues</p>
                </div>
                <Switch 
                  checked={formData.notifySystemAlerts || false}
                  onCheckedChange={(checked) => handleInputChange('notifySystemAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Admin Email Addresses</Label>
                <textarea 
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@basa.org&#10;manager@basa.org"
                  value={formData.adminEmails || ''}
                  onChange={(e) => handleInputChange('adminEmails', e.target.value)}
                />
                <p className="text-sm text-gray-500">One email address per line</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Stripe Public Key</Label>
                <Input 
                  placeholder="pk_test_..." 
                  value={formData.stripePublicKey || ''}
                  onChange={(e) => handleInputChange('stripePublicKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Stripe Secret Key</Label>
                <Input 
                  type="password" 
                  placeholder="sk_test_..." 
                  value={formData.stripeSecretKey || ''}
                  onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Test Mode</Label>
                  <p className="text-sm text-gray-500">Use test payment processing</p>
                </div>
                <Switch 
                  checked={formData.stripeTestMode || false}
                  onCheckedChange={(checked) => handleInputChange('stripeTestMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input 
                  placeholder="smtp.gmail.com" 
                  value={formData.smtpHost || ''}
                  onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input 
                  type="number" 
                  placeholder="587" 
                  value={formData.smtpPort || ''}
                  onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Username</Label>
                <Input 
                  placeholder="noreply@basa.org" 
                  value={formData.smtpUsername || ''}
                  onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email Password</Label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.smtpPassword || ''}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input 
                  placeholder="G-XXXXXXXXXX" 
                  value={formData.googleAnalyticsId || ''}
                  onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Google Tag Manager ID</Label>
                <Input 
                  placeholder="GTM-XXXXXXX" 
                  value={formData.googleTagManagerId || ''}
                  onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input 
                  placeholder="https://example.com/logo.png" 
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input 
                  placeholder="https://example.com/favicon.ico" 
                  value={formData.faviconUrl || ''}
                  onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input 
                    type="color" 
                    value={formData.primaryColor || '#1e40af'}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <Input 
                    type="color" 
                    value={formData.secondaryColor || '#059669'}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Member Count</Label>
                  <p className="text-sm text-gray-500">Display total member count publicly</p>
                </div>
                <Switch 
                  checked={formData.showMemberCount || false}
                  onCheckedChange={(checked) => handleInputChange('showMemberCount', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Event Calendar</Label>
                  <p className="text-sm text-gray-500">Display upcoming events on homepage</p>
                </div>
                <Switch 
                  checked={formData.showEventCalendar || false}
                  onCheckedChange={(checked) => handleInputChange('showEventCalendar', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Testimonials</Label>
                  <p className="text-sm text-gray-500">Display member testimonials</p>
                </div>
                <Switch 
                  checked={formData.showTestimonials || false}
                  onCheckedChange={(checked) => handleInputChange('showTestimonials', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  )
} 