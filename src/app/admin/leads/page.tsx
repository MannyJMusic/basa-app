import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Search, Mail, Phone, Calendar, Eye, Edit, MoreHorizontal } from "lucide-react"

export default function LeadsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">Track and manage potential BASA members</p>
        </div>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search leads..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-700" /> All Leads (37)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Lead</th>
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Source</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Added</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">Alex Rodriguez</div>
                      <div className="text-sm text-gray-500">Marketing Manager</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">Digital Marketing Pro</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Phone className="w-4 h-4 text-gray-500" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Website</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">2 days ago</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">Maria Garcia</div>
                      <div className="text-sm text-gray-500">CEO</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">Garcia Consulting</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Phone className="w-4 h-4 text-gray-500" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Referral</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-100 text-blue-800">Contacted</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">1 week ago</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">David Thompson</div>
                      <div className="text-sm text-gray-500">Operations Director</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">Thompson Logistics</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Phone className="w-4 h-4 text-gray-500" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Event</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-yellow-100 text-yellow-800">New</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">3 days ago</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">Jennifer Lee</div>
                      <div className="text-sm text-gray-500">HR Manager</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">Lee & Associates</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Phone className="w-4 h-4 text-gray-500" />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Social Media</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-red-100 text-red-800">Lost</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">2 weeks ago</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lead Conversion Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">24%</div>
            <p className="text-xs text-gray-500">+2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3 hours</div>
            <p className="text-xs text-gray-500">-0.5 hours from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">$12,400</div>
            <p className="text-xs text-gray-500">+15% from last month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 