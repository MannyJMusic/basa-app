import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Save,
  Eye,
  Key,
  Mail,
  Phone,
  MapPin,
  Building2
} from "lucide-react"

export default function AccountPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" defaultValue="(210) 555-0123" />
            </div>
            
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" defaultValue="Doe Marketing Group" />
            </div>
            
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" defaultValue="Marketing Consultant" />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Select defaultValue="downtown">
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downtown">Downtown SA</SelectItem>
                  <SelectItem value="north">North SA</SelectItem>
                  <SelectItem value="south">South SA</SelectItem>
                  <SelectItem value="east">East SA</SelectItem>
                  <SelectItem value="west">West SA</SelectItem>
                  <SelectItem value="suburbs">Suburbs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle>Security Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your password and security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input id="currentPassword" type="password" />
                <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type="password" />
                <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input id="confirmPassword" type="password" />
                <Button variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="twoFactor" />
              <div>
                <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout</Label>
                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full">
              <Key className="w-4 h-4 mr-2" />
              Update Security Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose how and when you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="emailNotifications" defaultChecked />
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="smsNotifications" />
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates via text</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="eventReminders" defaultChecked />
                <div>
                  <Label htmlFor="eventReminders">Event Reminders</Label>
                  <p className="text-sm text-gray-500">Get reminded about upcoming events</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="connectionRequests" defaultChecked />
                <div>
                  <Label htmlFor="connectionRequests">Connection Requests</Label>
                  <p className="text-sm text-gray-500">Notify when someone wants to connect</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="newsletter" />
                <div>
                  <Label htmlFor="newsletter">Newsletter</Label>
                  <p className="text-sm text-gray-500">Receive monthly newsletter</p>
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
            
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <CardTitle>Billing Information</CardTitle>
            </div>
            <CardDescription>
              Manage your membership and payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-gray-600">Premium Membership</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Next Billing Date</p>
              <p className="text-sm text-gray-600">March 15, 2024</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Amount</p>
              <p className="text-sm text-gray-600">$299.00/year</p>
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="**** **** **** 1234" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button className="flex-1">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment
              </Button>
              <Button variant="outline">
                View Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 