import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Edit,
  Save,
  Award,
  Star,
  Users,
  Handshake,
  Calendar,
  Target,
  Heart,
  TrendingUp,
  CheckCircle,
  Plus,
  X
} from "lucide-react"

export default function DashboardProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional profile and networking presence</p>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">John Doe</h2>
                  <p className="text-gray-600">Marketing Consultant</p>
                  <p className="text-sm text-gray-500">Member since January 2022</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Premium Member
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Verified
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" defaultValue="Doe Marketing Group" />
                </div>
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" defaultValue="Marketing Consultant" />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="marketing">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="real-estate">Real Estate</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select defaultValue="downtown">
                    <SelectTrigger>
                      <SelectValue />
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
              </div>
              
              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  defaultValue="Experienced marketing consultant with over 10 years helping businesses grow their digital presence. Specializing in social media marketing, content strategy, and brand development. Passionate about connecting with fellow business leaders and sharing insights."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="(210) 555-0123" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://doemarketing.com" />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" defaultValue="linkedin.com/in/johndoe" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services & Expertise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Services & Expertise</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Services Offered</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Digital Marketing
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Social Media Management
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Content Strategy
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Brand Development
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Marketing Consulting
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Button variant="outline" size="sm" className="h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Service
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      B2B Marketing
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Lead Generation
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Email Marketing
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      SEO
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Analytics
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Button variant="outline" size="sm" className="h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Expertise
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Industries Served</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Technology
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Healthcare
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Real Estate
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      Professional Services
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                    <Button variant="outline" size="sm" className="h-6">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Industry
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Professional Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Senior Marketing Consultant</h4>
                      <p className="text-sm text-gray-600">Doe Marketing Group</p>
                      <p className="text-sm text-gray-500">2020 - Present</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Lead digital marketing strategies for B2B clients, specializing in lead generation and brand development.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Marketing Manager</h4>
                      <p className="text-sm text-gray-600">TechFlow Solutions</p>
                      <p className="text-sm text-gray-500">2018 - 2020</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Managed marketing campaigns and brand development for a growing technology startup.
                  </p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </CardContent>
          </Card>

          {/* Education & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span>Education & Certifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">MBA in Marketing</h4>
                      <p className="text-sm text-gray-600">University of Texas at Austin</p>
                      <p className="text-sm text-gray-500">2016 - 2018</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">Google Ads Certification</h4>
                      <p className="text-sm text-gray-600">Google</p>
                      <p className="text-sm text-gray-500">2021</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Education/Certification
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Networking Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm">Connections</span>
                </div>
                <span className="font-bold">156</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Handshake className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Meetings</span>
                </div>
                <span className="font-bold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">Events Attended</span>
                </div>
                <span className="font-bold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm">Referrals Given</span>
                </div>
                <span className="font-bold">12</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Top Referrer 2023</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Perfect Attendance 2023</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Community Champion</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Mentor Program Graduate</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium">Connected with Sarah Johnson</p>
                <p className="text-gray-500">2 days ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Attended Monthly Mixer</p>
                <p className="text-gray-500">1 week ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Referred client to Mike Chen</p>
                <p className="text-gray-500">2 weeks ago</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Updated profile information</p>
                <p className="text-gray-500">1 month ago</p>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic Information</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contact Information</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Services & Expertise</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Professional Experience</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Education</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Profile Complete!</p>
                <p className="text-xs text-green-600">Your profile is 100% complete</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/directory">Browse Directory</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/events">View Events</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/resources">Access Resources</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/account">Account Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Changes Button */}
      <div className="flex justify-end">
        <Button size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
} 