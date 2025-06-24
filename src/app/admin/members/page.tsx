import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"

export default function MembersPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-2">Manage your BASA members and their accounts</p>
        </div>
        <Button className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Add Member
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search members..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" /> All Members (152)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">John Smith</div>
                      <div className="text-sm text-gray-500">Marketing Director</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">john.smith@company.com</td>
                  <td className="py-3 px-4">Tech Solutions Inc.</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Professional</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">Jan 15, 2024</td>
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
                      <div className="font-medium">Sarah Johnson</div>
                      <div className="text-sm text-gray-500">CEO</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">sarah@startup.com</td>
                  <td className="py-3 px-4">Innovation Labs</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Corporate</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">Dec 20, 2023</td>
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
                      <div className="font-medium">Mike Davis</div>
                      <div className="text-sm text-gray-500">Consultant</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">mike@consulting.com</td>
                  <td className="py-3 px-4">Davis Consulting</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Essential</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">Feb 1, 2024</td>
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
                      <div className="font-medium">Lisa Chen</div>
                      <div className="text-sm text-gray-500">Operations Manager</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">lisa@manufacturing.com</td>
                  <td className="py-3 px-4">San Antonio Manufacturing</td>
                  <td className="py-3 px-4">
                    <Badge variant="secondary">Professional</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-red-100 text-red-800">Suspended</Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">Nov 10, 2023</td>
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
    </div>
  )
} 