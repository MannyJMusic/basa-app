"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Search, Edit, Trash2, Eye, Download, Filter, X, Upload, FileText, CheckCircle, AlertCircle, UserPlus } from "lucide-react"
import { useMembers, type Member, type MemberFilters, type BulkUploadResult } from "@/hooks/use-members"
import { MemberDetailDialog } from "@/components/members/member-detail-dialog"
import { EnhancedMemberForm } from "@/components/admin/enhanced-member-form"
import { formatDate } from "@/lib/utils"

export default function MembersPage() {
  const { fetchMembers, createMember, deleteMember, updateMember, exportMembers, bulkUploadMembers, loading } = useMembers()
  const [members, setMembers] = useState<Member[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [filters, setFilters] = useState<MemberFilters>({
    page: 1,
    limit: 20,
    sortBy: "joinedAt",
    sortOrder: "desc",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [isEnhancedCreateDialogOpen, setIsEnhancedCreateDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState(false)
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  // Load members on component mount and when filters change
  useEffect(() => {
    loadMembers()
  }, [filters])

  const loadMembers = async () => {
    const result = await fetchMembers(filters)
    if (result) {
      setMembers(result.members)
      setPagination(result.pagination)
    }
  }

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined,
      page: 1, // Reset to first page when searching
    }))
  }

  const handleFilterChange = (key: keyof MemberFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }



  const handleUpdateMember = async (id: string, data: any) => {
    try {
      await updateMember(id, data)
      loadMembers() // Refresh the list
      return true
    } catch (error) {
      return false
    }
  }

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteMember(id)
      loadMembers() // Refresh the list
      return true
    } catch (error) {
      return false
    }
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setIsDetailDialogOpen(true)
  }

  const handleExport = async () => {
    await exportMembers(filters, "csv")
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please select a CSV file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleBulkUpload = async () => {
    if (!selectedFile) return

    const result = await bulkUploadMembers(selectedFile)
    if (result) {
      setUploadResult(result)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      loadMembers() // Refresh the list
    }
  }

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/api/members/template'
    link.download = `basa-members-template-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "SUSPENDED":
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case "BASIC":
        return <Badge variant="secondary">Basic</Badge>
      case "PREMIUM":
        return <Badge className="bg-blue-100 text-blue-800">Premium</Badge>
      case "VIP":
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
      default:
        return <Badge variant="outline">No Tier</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your BASA members and their accounts ({pagination.total} total members)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setIsEnhancedCreateDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </Button>
          <Dialog open={isBulkUploadDialogOpen} onOpenChange={setIsBulkUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Upload Members</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Download the template below to see the required format</li>
                    <li>• Maximum 1000 members per upload</li>
                    <li>• File size must be less than 5MB</li>
                    <li>• Passwords are optional - random passwords will be generated</li>
                    <li>• Industry should be comma-separated values</li>
                    <li>• Existing members will be updated, new ones will be created</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadTemplate}>
                    <FileText className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select CSV File</label>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {uploadResult && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Upload Results:</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Created: {uploadResult.created}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span>Updated: {uploadResult.updated}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span>Failed: {uploadResult.failed}</span>
                      </div>
                      <div>
                        <span>Total: {uploadResult.total}</span>
                      </div>
                    </div>
                    {uploadResult.errors.length > 0 && (
                      <div className="mt-3">
                        <h5 className="font-medium text-red-600 mb-1">Errors:</h5>
                        <div className="max-h-32 overflow-y-auto text-xs">
                          {uploadResult.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-red-600">
                              Row {error.row}: {error.email} - {error.error}
                            </div>
                          ))}
                          {uploadResult.errors.length > 5 && (
                            <div className="text-gray-500">
                              ... and {uploadResult.errors.length - 5} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsBulkUploadDialogOpen(false)
                      setUploadResult(null)
                      setSelectedFile(null)
                    }}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={handleBulkUpload} 
                    disabled={!selectedFile || loading}
                  >
                    {loading ? "Uploading..." : "Upload Members"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search members by name, email, or business..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
            {filters.search && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setFilters(prev => ({ ...prev, search: undefined, page: 1 }))
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            All Members ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Business</th>
                      <th className="text-left py-3 px-4 font-medium">Tier</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Joined</th>
                      <th className="text-left py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {member.user.firstName} {member.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{member.user.role}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{member.user.email}</td>
                        <td className="py-3 px-4">
                          {member.businessName || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {getTierBadge(member.membershipTier)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(member.membershipStatus)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {formatDate(member.joinedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewMember(member)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewMember(member)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                    {pagination.total} members
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Member Creation Dialog */}
      <EnhancedMemberForm
        isOpen={isEnhancedCreateDialogOpen}
        onClose={() => setIsEnhancedCreateDialogOpen(false)}
        onSuccess={() => {
          setIsEnhancedCreateDialogOpen(false)
          loadMembers()
        }}
      />

      {/* Member Detail Dialog */}
      <MemberDetailDialog
        member={selectedMember}
        isOpen={isDetailDialogOpen}
        onClose={() => {
          setIsDetailDialogOpen(false)
          setSelectedMember(null)
        }}
        onUpdate={handleUpdateMember}
        onDelete={handleDeleteMember}
        isLoading={loading}
      />

      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => handleFilterChange("status", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Membership Tier</label>
              <Select
                value={filters.membershipTier || ""}
                onValueChange={(value) => handleFilterChange("membershipTier", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tiers</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PREMIUM">Premium</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <Select
                value={filters.sortBy || "joinedAt"}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joinedAt">Joined Date</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="businessName">Business Name</SelectItem>
                  <SelectItem value="membershipTier">Membership Tier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <Select
                value={filters.sortOrder || "desc"}
                onValueChange={(value) => handleFilterChange("sortOrder", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 20,
                    sortBy: "joinedAt",
                    sortOrder: "desc",
                  })
                  setIsFilterDialogOpen(false)
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setIsFilterDialogOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 