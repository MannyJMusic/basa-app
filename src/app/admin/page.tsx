import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, UserPlus, Activity } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Events Hosted</CardTitle>
            <Calendar className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,400</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <UserPlus className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">37</div>
            <p className="text-xs text-muted-foreground">+8 this month</p>
          </CardContent>
        </Card>
      </div>
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-700" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200 text-sm">
            <li className="py-2 flex items-center justify-between">
              <span>New member <b>Jane Smith</b> approved</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </li>
            <li className="py-2 flex items-center justify-between">
              <span>Event <b>Monthly Mixer</b> created</span>
              <span className="text-xs text-gray-500">1 day ago</span>
            </li>
            <li className="py-2 flex items-center justify-between">
              <span>Payment of <b>$400</b> received</span>
              <span className="text-xs text-gray-500">2 days ago</span>
            </li>
            <li className="py-2 flex items-center justify-between">
              <span>Lead <b>John Doe</b> added</span>
              <span className="text-xs text-gray-500">3 days ago</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
} 