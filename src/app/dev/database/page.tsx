"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  Table, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  Search,
  Download,
  Eye,
  RefreshCw,
  Loader2
} from "lucide-react"

interface TableInfo {
  name: string
  count: number
  description: string
  icon: string
}

interface TableData {
  columns: string[]
  data: any[]
  totalCount: number
}

interface ColumnConfig {
  name: string
  label: string
  defaultVisible: boolean
  type: 'text' | 'email' | 'date' | 'boolean' | 'number' | 'json' | 'array'
}

export default function DatabaseBrowserPage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string>("")
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [visibleColumns, setVisibleColumns] = useState<string[]>([])
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const tableDefinitions: TableInfo[] = [
    { name: "User", count: 0, description: "User accounts and authentication", icon: "Users" },
    { name: "Member", count: 0, description: "Business member profiles", icon: "Users" },
    { name: "Event", count: 0, description: "Events and networking opportunities", icon: "Calendar" },
    { name: "EventRegistration", count: 0, description: "Event registrations and payments", icon: "Calendar" },
    { name: "BlogPost", count: 0, description: "Blog posts and content", icon: "FileText" },
    { name: "Testimonial", count: 0, description: "Member testimonials", icon: "FileText" },
    { name: "Lead", count: 0, description: "Lead generation and inquiries", icon: "Users" },
    { name: "Resource", count: 0, description: "Member resources and downloads", icon: "FileText" },
    { name: "Settings", count: 0, description: "Application settings and configuration", icon: "Settings" },
    { name: "AuditLog", count: 0, description: "System audit logs", icon: "FileText" },
  ]

  // Column configurations for each table with developer-friendly defaults
  const columnConfigs: Record<string, ColumnConfig[]> = {
    User: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'email', label: 'Email', defaultVisible: true, type: 'email' },
      { name: 'firstName', label: 'First Name', defaultVisible: true, type: 'text' },
      { name: 'lastName', label: 'Last Name', defaultVisible: true, type: 'text' },
      { name: 'name', label: 'Full Name', defaultVisible: false, type: 'text' },
      { name: 'role', label: 'Role', defaultVisible: true, type: 'text' },
      { name: 'accountStatus', label: 'Status', defaultVisible: true, type: 'text' },
      { name: 'isActive', label: 'Active', defaultVisible: true, type: 'boolean' },
      { name: 'createdAt', label: 'Created', defaultVisible: true, type: 'date' },
      { name: 'lastLogin', label: 'Last Login', defaultVisible: false, type: 'date' },
      { name: 'phone', label: 'Phone', defaultVisible: false, type: 'text' },
      { name: 'newsletterSubscribed', label: 'Newsletter', defaultVisible: false, type: 'boolean' },
      { name: 'membershipPaymentConfirmed', label: 'Payment Confirmed', defaultVisible: false, type: 'boolean' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    Member: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'businessName', label: 'Business Name', defaultVisible: true, type: 'text' },
      { name: 'businessEmail', label: 'Business Email', defaultVisible: true, type: 'email' },
      { name: 'businessPhone', label: 'Phone', defaultVisible: true, type: 'text' },
      { name: 'city', label: 'City', defaultVisible: true, type: 'text' },
      { name: 'state', label: 'State', defaultVisible: true, type: 'text' },
      { name: 'membershipTier', label: 'Tier', defaultVisible: true, type: 'text' },
      { name: 'membershipStatus', label: 'Status', defaultVisible: true, type: 'text' },
      { name: 'joinedAt', label: 'Joined', defaultVisible: true, type: 'date' },
      { name: 'businessType', label: 'Business Type', defaultVisible: false, type: 'text' },
      { name: 'industry', label: 'Industry', defaultVisible: false, type: 'array' },
      { name: 'website', label: 'Website', defaultVisible: false, type: 'text' },
      { name: 'showInDirectory', label: 'In Directory', defaultVisible: false, type: 'boolean' },
      { name: 'allowContact', label: 'Allow Contact', defaultVisible: false, type: 'boolean' },
      { name: 'stripeCustomerId', label: 'Stripe Customer', defaultVisible: false, type: 'text' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    Event: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'title', label: 'Title', defaultVisible: true, type: 'text' },
      { name: 'startDate', label: 'Start Date', defaultVisible: true, type: 'date' },
      { name: 'endDate', label: 'End Date', defaultVisible: true, type: 'date' },
      { name: 'location', label: 'Location', defaultVisible: true, type: 'text' },
      { name: 'status', label: 'Status', defaultVisible: true, type: 'text' },
      { name: 'category', label: 'Category', defaultVisible: true, type: 'text' },
      { name: 'price', label: 'Price', defaultVisible: true, type: 'number' },
      { name: 'capacity', label: 'Capacity', defaultVisible: false, type: 'number' },
      { name: 'isFeatured', label: 'Featured', defaultVisible: false, type: 'boolean' },
      { name: 'type', label: 'Type', defaultVisible: false, type: 'text' },
      { name: 'tags', label: 'Tags', defaultVisible: false, type: 'array' },
      { name: 'createdAt', label: 'Created', defaultVisible: false, type: 'date' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    EventRegistration: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'name', label: 'Name', defaultVisible: true, type: 'text' },
      { name: 'email', label: 'Email', defaultVisible: true, type: 'email' },
      { name: 'company', label: 'Company', defaultVisible: true, type: 'text' },
      { name: 'status', label: 'Status', defaultVisible: true, type: 'text' },
      { name: 'totalAmount', label: 'Amount', defaultVisible: true, type: 'number' },
      { name: 'ticketCount', label: 'Tickets', defaultVisible: true, type: 'number' },
      { name: 'createdAt', label: 'Registered', defaultVisible: true, type: 'date' },
      { name: 'phone', label: 'Phone', defaultVisible: false, type: 'text' },
      { name: 'paymentIntentId', label: 'Payment ID', defaultVisible: false, type: 'text' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    BlogPost: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'title', label: 'Title', defaultVisible: true, type: 'text' },
      { name: 'status', label: 'Status', defaultVisible: true, type: 'text' },
      { name: 'publishedAt', label: 'Published', defaultVisible: true, type: 'date' },
      { name: 'viewCount', label: 'Views', defaultVisible: true, type: 'number' },
      { name: 'isFeatured', label: 'Featured', defaultVisible: true, type: 'boolean' },
      { name: 'excerpt', label: 'Excerpt', defaultVisible: false, type: 'text' },
      { name: 'tags', label: 'Tags', defaultVisible: false, type: 'array' },
      { name: 'createdAt', label: 'Created', defaultVisible: false, type: 'date' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    Testimonial: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'authorName', label: 'Author', defaultVisible: true, type: 'text' },
      { name: 'authorTitle', label: 'Title', defaultVisible: true, type: 'text' },
      { name: 'company', label: 'Company', defaultVisible: true, type: 'text' },
      { name: 'status', label: 'Status', defaultVisible: true, type: 'boolean' },
      { name: 'rating', label: 'Rating', defaultVisible: true, type: 'number' },
      { name: 'isFeatured', label: 'Featured', defaultVisible: true, type: 'boolean' },
      { name: 'content', label: 'Content', defaultVisible: false, type: 'text' },
      { name: 'createdAt', label: 'Created', defaultVisible: false, type: 'date' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    Lead: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'name', label: 'Name', defaultVisible: true, type: 'text' },
      { name: 'email', label: 'Email', defaultVisible: true, type: 'email' },
      { name: 'company', label: 'Company', defaultVisible: true, type: 'text' },
      { name: 'status', label: 'Status', defaultVisible: true, type: 'text' },
      { name: 'source', label: 'Source', defaultVisible: true, type: 'text' },
      { name: 'createdAt', label: 'Created', defaultVisible: true, type: 'date' },
      { name: 'phone', label: 'Phone', defaultVisible: false, type: 'text' },
      { name: 'message', label: 'Message', defaultVisible: false, type: 'text' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    Resource: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'title', label: 'Title', defaultVisible: true, type: 'text' },
      { name: 'category', label: 'Category', defaultVisible: true, type: 'text' },
      { name: 'isActive', label: 'Active', defaultVisible: true, type: 'boolean' },
      { name: 'downloadCount', label: 'Downloads', defaultVisible: true, type: 'number' },
      { name: 'fileType', label: 'File Type', defaultVisible: true, type: 'text' },
      { name: 'createdAt', label: 'Created', defaultVisible: false, type: 'date' },
      { name: 'description', label: 'Description', defaultVisible: false, type: 'text' },
      { name: 'tags', label: 'Tags', defaultVisible: false, type: 'array' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    Settings: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'organizationName', label: 'Organization', defaultVisible: true, type: 'text' },
      { name: 'contactEmail', label: 'Contact Email', defaultVisible: true, type: 'email' },
      { name: 'maintenanceMode', label: 'Maintenance Mode', defaultVisible: true, type: 'boolean' },
      { name: 'autoApproveMembers', label: 'Auto Approve', defaultVisible: true, type: 'boolean' },
      { name: 'emailNotifications', label: 'Email Notifications', defaultVisible: true, type: 'boolean' },
      { name: 'stripeTestMode', label: 'Stripe Test Mode', defaultVisible: true, type: 'boolean' },
      { name: 'phoneNumber', label: 'Phone', defaultVisible: false, type: 'text' },
      { name: 'website', label: 'Website', defaultVisible: false, type: 'text' },
      { name: 'createdAt', label: 'Created', defaultVisible: false, type: 'date' },
      { name: 'updatedAt', label: 'Updated', defaultVisible: false, type: 'date' },
    ],
    AuditLog: [
      { name: 'id', label: 'ID', defaultVisible: false, type: 'text' },
      { name: 'action', label: 'Action', defaultVisible: true, type: 'text' },
      { name: 'entityType', label: 'Entity Type', defaultVisible: true, type: 'text' },
      { name: 'entityId', label: 'Entity ID', defaultVisible: true, type: 'text' },
      { name: 'timestamp', label: 'Timestamp', defaultVisible: true, type: 'date' },
      { name: 'ipAddress', label: 'IP Address', defaultVisible: false, type: 'text' },
      { name: 'userAgent', label: 'User Agent', defaultVisible: false, type: 'text' },
    ],
  }

  useEffect(() => {
    loadTableCounts()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      // Initialize visible columns based on column config
      const config = columnConfigs[selectedTable]
      if (config) {
        const defaultVisible = config.filter(col => col.defaultVisible).map(col => col.name)
        setVisibleColumns(defaultVisible)
      }
    }
  }, [selectedTable])



  useEffect(() => {
    if (selectedTable && visibleColumns.length > 0) {
      loadTableData()
    }
  }, [selectedTable, currentPage, pageSize, searchTerm, visibleColumns])

  const loadTableCounts = async () => {
    try {
      const response = await fetch('/api/dev/database/tables')
      const data = await response.json()
      
      if (data.success) {
        const updatedTables = tableDefinitions.map(table => ({
          ...table,
          count: data.counts[table.name] || 0
        }))
        setTables(updatedTables)
      }
    } catch (error) {
      console.error('Failed to load table counts:', error)
    }
  }

  const loadTableData = async () => {
    if (!selectedTable) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        table: selectedTable,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        search: searchTerm,
        columns: visibleColumns.join(',')
      })
      
      const response = await fetch(`/api/dev/database/data?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setTableData(data.data)
      }
    } catch (error) {
      console.error('Failed to load table data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportTableData = async (format: 'json' | 'csv') => {
    if (!selectedTable) return
    
    try {
      const params = new URLSearchParams({
        table: selectedTable,
        format,
        search: searchTerm,
        columns: visibleColumns.join(',')
      })
      
      const response = await fetch(`/api/dev/database/export?${params}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTable}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Users": return <Users className="w-4 h-4" />
      case "Calendar": return <Calendar className="w-4 h-4" />
      case "FileText": return <FileText className="w-4 h-4" />
      case "Settings": return <Settings className="w-4 h-4" />
      default: return <Table className="w-4 h-4" />
    }
  }

  const formatCellValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-'
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'array':
        return Array.isArray(value) ? value.join(', ') : String(value)
      case 'json':
        return typeof value === 'object' ? JSON.stringify(value) : String(value)
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value)
      default:
        return String(value)
    }
  }

  const toggleColumn = (columnName: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnName) 
        ? prev.filter(col => col !== columnName)
        : [...prev, columnName]
    )
  }

  const resetToDefaults = () => {
    const config = columnConfigs[selectedTable]
    if (config) {
      const defaultVisible = config.filter(col => col.defaultVisible).map(col => col.name)
      setVisibleColumns(defaultVisible)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Database Browser</h1>
          <p className="text-xl text-gray-600">
            Explore and interact with your BASA database tables
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Table Overview</TabsTrigger>
            <TabsTrigger value="browser">Data Browser</TabsTrigger>
            <TabsTrigger value="quick">Quick Actions</TabsTrigger>
          </TabsList>

          {/* Table Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <Card 
                  key={table.name} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTable(table.name)
                    setCurrentPage(1)
                    setSearchTerm("")
                    setActiveTab("browser")
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getIcon(table.icon)}
                        <CardTitle className="text-lg">{table.name}</CardTitle>
                      </div>
                      <Badge variant="secondary">{table.count}</Badge>
                    </div>
                    <CardDescription>{table.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Browser */}
          <TabsContent value="browser" className="space-y-6">
            {selectedTable ? (
              <div className="space-y-6">
                {/* Table Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          {getIcon(tables.find(t => t.name === selectedTable)?.icon || "Table")}
                          <span>{selectedTable}</span>
                        </CardTitle>
                        <CardDescription>
                          {tableData ? `${tableData.totalCount} total records` : 'Loading...'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowColumnSelector(!showColumnSelector)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Columns
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportTableData('json')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export JSON
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportTableData('csv')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadTableData}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                          )}
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Pagination */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <Label htmlFor="search">Search</Label>
                          <Input
                            id="search"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pageSize">Page Size</Label>
                          <select
                            id="pageSize"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            className="border rounded px-3 py-2"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Column Selector */}
                    {showColumnSelector && columnConfigs[selectedTable] && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Select Visible Columns</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetToDefaults}
                          >
                            Reset to Defaults
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {columnConfigs[selectedTable].map((column) => (
                            <label key={column.name} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={visibleColumns.includes(column.name)}
                                onChange={() => toggleColumn(column.name)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{column.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Data Table */}
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin" />
                      </div>
                    ) : tableData ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-100">
                              {visibleColumns.map((columnName) => {
                                const columnConfig = columnConfigs[selectedTable]?.find(col => col.name === columnName)
                                return (
                                  <th key={columnName} className="border border-gray-300 px-4 py-2 text-left">
                                    {columnConfig?.label || columnName}
                                  </th>
                                )
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.data.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                {visibleColumns.map((columnName) => {
                                  const columnConfig = columnConfigs[selectedTable]?.find(col => col.name === columnName)
                                  const value = row[columnName]
                                  return (
                                    <td key={columnName} className="border border-gray-300 px-4 py-2">
                                      <div className="max-w-xs truncate">
                                        {formatCellValue(value, columnConfig?.type || 'text')}
                                      </div>
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No data available
                      </div>
                    )}

                    {/* Pagination */}
                    {tableData && tableData.totalCount > pageSize && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">
                          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, tableData.totalCount)} of {tableData.totalCount} records
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="px-3 py-1 bg-gray-100 rounded">
                            Page {currentPage} of {Math.ceil(tableData.totalCount / pageSize)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={currentPage >= Math.ceil(tableData.totalCount / pageSize)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Table</h3>
                  <p className="text-gray-600">
                    Choose a table from the overview to browse its data
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quick Actions */}
          <TabsContent value="quick" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Recent Users</span>
                  </CardTitle>
                  <CardDescription>View the latest user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedTable("User")
                      setCurrentPage(1)
                      setSearchTerm("")
                      setActiveTab("browser")
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Recent Users
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Upcoming Events</span>
                  </CardTitle>
                  <CardDescription>Check events scheduled for the future</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedTable("Event")
                      setCurrentPage(1)
                      setSearchTerm("")
                      setActiveTab("browser")
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Events
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>System Settings</span>
                  </CardTitle>
                  <CardDescription>View and manage application settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedTable("Settings")
                      setCurrentPage(1)
                      setSearchTerm("")
                      setActiveTab("browser")
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Settings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Audit Logs</span>
                  </CardTitle>
                  <CardDescription>Review system activity and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedTable("AuditLog")
                      setCurrentPage(1)
                      setSearchTerm("")
                      setActiveTab("browser")
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Audit Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 