import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Bell, 
  Eye, 
  Palette, 
  Globe,
  Save,
  Moon,
  Sun,
  Monitor,
  Shield,
  Users,
  Mail,
  Smartphone,
  Link,
  Unlink
} from "lucide-react"
import SocialAccounts from "@/components/auth/social-accounts"

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Customize your dashboard experience and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Accounts */}
        <SocialAccounts />

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select defaultValue="system">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="density">Density</Label>
              <Select defaultValue="comfortable">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="spacious">Spacious</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fontSize">Font Size</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="animations" defaultChecked />
              <div>
                <Label htmlFor="animations">Enable Animations</Label>
                <p className="text-sm text-gray-500">Show smooth transitions and animations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="emailNotif" defaultChecked />
                <div>
                  <Label htmlFor="emailNotif">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="smsNotif" />
                <div>
                  <Label htmlFor="smsNotif">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via text message</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="pushNotif" defaultChecked />
                <div>
                  <Label htmlFor="pushNotif">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser notifications</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="notificationFrequency">Notification Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quietHours">Quiet Hours</Label>
              <Select defaultValue="none">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No quiet hours</SelectItem>
                  <SelectItem value="10pm-8am">10 PM - 8 AM</SelectItem>
                  <SelectItem value="11pm-7am">11 PM - 7 AM</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>
              Control your privacy and data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="profileVisibility" defaultChecked />
                <div>
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <p className="text-sm text-gray-500">Allow other members to view your profile</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="contactInfo" defaultChecked />
                <div>
                  <Label htmlFor="contactInfo">Show Contact Information</Label>
                  <p className="text-sm text-gray-500">Display email and phone in directory</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="activityFeed" />
                <div>
                  <Label htmlFor="activityFeed">Activity Feed</Label>
                  <p className="text-sm text-gray-500">Show your activity to other members</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="analytics" defaultChecked />
                <div>
                  <Label htmlFor="analytics">Analytics Sharing</Label>
                  <p className="text-sm text-gray-500">Help improve BASA with anonymous data</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="dataRetention">Data Retention</Label>
              <Select defaultValue="2years">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                  <SelectItem value="5years">5 Years</SelectItem>
                  <SelectItem value="indefinite">Indefinite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-orange-600" />
              <CardTitle>Dashboard Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your dashboard layout and features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultView">Default Dashboard View</Label>
              <Select defaultValue="overview">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="directory">Member Directory</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="resources">Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sidebarPosition">Sidebar Position</Label>
              <Select defaultValue="left">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="collapsed">Collapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="showStats" defaultChecked />
                <div>
                  <Label htmlFor="showStats">Show Quick Stats</Label>
                  <p className="text-sm text-gray-500">Display statistics on dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="showRecentActivity" defaultChecked />
                <div>
                  <Label htmlFor="showRecentActivity">Show Recent Activity</Label>
                  <p className="text-sm text-gray-500">Display recent interactions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="showRecommendations" />
                <div>
                  <Label htmlFor="showRecommendations">Show Recommendations</Label>
                  <p className="text-sm text-gray-500">Display personalized suggestions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <CardTitle>Language & Region</CardTitle>
            </div>
            <CardDescription>
              Set your language and regional preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select defaultValue="en">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="cst">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cst">Central Standard Time</SelectItem>
                  <SelectItem value="est">Eastern Standard Time</SelectItem>
                  <SelectItem value="pst">Pacific Standard Time</SelectItem>
                  <SelectItem value="mst">Mountain Standard Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select defaultValue="mm-dd-yyyy">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="cad">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-teal-600" />
              <CardTitle>Accessibility</CardTitle>
            </div>
            <CardDescription>
              Customize accessibility features for better usability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="highContrast" />
                <div>
                  <Label htmlFor="highContrast">High Contrast Mode</Label>
                  <p className="text-sm text-gray-500">Increase contrast for better visibility</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="reducedMotion" />
                <div>
                  <Label htmlFor="reducedMotion">Reduced Motion</Label>
                  <p className="text-sm text-gray-500">Minimize animations and transitions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="screenReader" />
                <div>
                  <Label htmlFor="screenReader">Screen Reader Support</Label>
                  <p className="text-sm text-gray-500">Optimize for screen readers</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="keyboardNav" defaultChecked />
                <div>
                  <Label htmlFor="keyboardNav">Keyboard Navigation</Label>
                  <p className="text-sm text-gray-500">Enable keyboard shortcuts</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="focusIndicator">Focus Indicator</Label>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="high">High Visibility</SelectItem>
                  <SelectItem value="color">Color Only</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
} 