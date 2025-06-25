"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { 
  FileText, 
  Plus, 
  Edit, 
  Eye, 
  MoreHorizontal, 
  Star, 
  Users, 
  Calendar,
  Search,
  Filter,
  Trash2,
  Download,
  ExternalLink
} from "lucide-react"
import { ContentEditor } from "@/components/admin/content-editor"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  publishedAt?: string
  tags: string[]
  isFeatured: boolean
  viewCount: number
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface Testimonial {
  id: string
  authorName: string
  authorTitle?: string
  authorCompany?: string
  authorImage?: string
  content: string
  rating: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  isFeatured: boolean
  member?: {
    id: string
    businessName: string
    user: {
      name: string
      email: string
    }
  }
  createdAt: string
  updatedAt: string
}

interface Resource {
  id: string
  title: string
  description?: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
  downloadCount: number
  isActive: boolean
  category?: string
  tags: string[]
  member?: {
    id: string
    businessName: string
    user: {
      name: string
      email: string
    }
  }
  createdAt: string
  updatedAt: string
}

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("blog")
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showEditor, setShowEditor] = useState(false)
  const [editingContent, setEditingContent] = useState<any>(null)
  const [contentType, setContentType] = useState<"blog" | "testimonial" | "resource">("blog")

  // Fetch content data
  const fetchBlogPosts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/content/blog-posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      })
    }
  }

  const fetchTestimonials = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter)
      
      const response = await fetch(`/api/content/testimonials?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.testimonials)
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      })
    }
  }

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter && statusFilter !== "all") params.append("isActive", statusFilter)
      
      const response = await fetch(`/api/content/resources?${params}`)
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources)
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchBlogPosts(),
        fetchTestimonials(),
        fetchResources(),
      ])
      setIsLoading(false)
    }
    fetchData()
  }, [searchTerm, statusFilter])

  const handleCreateContent = (type: "blog" | "testimonial" | "resource") => {
    setContentType(type)
    setEditingContent(null)
    setShowEditor(true)
  }

  const handleEditContent = (content: any, type: "blog" | "testimonial" | "resource") => {
    setContentType(type)
    setEditingContent(content)
    setShowEditor(true)
  }

  const handleSaveContent = async (data: any) => {
    try {
      const url = editingContent 
        ? `/api/content/${contentType === "blog" ? "blog-posts" : contentType === "testimonial" ? "testimonials" : "resources"}/${editingContent.id}`
        : `/api/content/${contentType === "blog" ? "blog-posts" : contentType === "testimonial" ? "testimonials" : "resources"}`
      
      const method = editingContent ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setShowEditor(false)
        setEditingContent(null)
        
        // Refresh data
        if (contentType === "blog") await fetchBlogPosts()
        else if (contentType === "testimonial") await fetchTestimonials()
        else await fetchResources()
        
        toast({
          title: "Success",
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} saved successfully`,
        })
      } else {
        throw new Error("Failed to save content")
      }
    } catch (error) {
      console.error("Error saving content:", error)
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContent = async (id: string, type: "blog" | "testimonial" | "resource") => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/content/${type === "blog" ? "blog-posts" : type === "testimonial" ? "testimonials" : "resources"}/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh data
        if (type === "blog") await fetchBlogPosts()
        else if (type === "testimonial") await fetchTestimonials()
        else await fetchResources()
        
        toast({
          title: "Success",
          description: "Item deleted successfully",
        })
      } else {
        throw new Error("Failed to delete item")
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "DRAFT":
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "ARCHIVED":
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-2">Manage blog posts, testimonials, and resources</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleCreateContent("blog")} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Blog Post
          </Button>
          <Button onClick={() => handleCreateContent("testimonial")} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Testimonial
          </Button>
          <Button onClick={() => handleCreateContent("resource")} variant="outline" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Resource
          </Button>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{blogPosts.length}</div>
            <p className="text-xs text-gray-500">
              {blogPosts.filter(p => p.status === "DRAFT").length} drafts, {blogPosts.filter(p => p.status === "PUBLISHED").length} published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{testimonials.length}</div>
            <p className="text-xs text-gray-500">
              {testimonials.filter(t => t.status === "APPROVED").length} approved, {testimonials.filter(t => t.status === "PENDING").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{resources.length}</div>
            <p className="text-xs text-gray-500">
              {resources.filter(r => r.isActive).length} active, {resources.filter(r => !r.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {blogPosts.reduce((sum, post) => sum + post.viewCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-green-600">+12% this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Search and Filter */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {activeTab === "blog" && (
                <>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </>
              )}
              {activeTab === "testimonials" && (
                <>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </>
              )}
              {activeTab === "resources" && (
                <>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Blog Posts Tab */}
        <TabsContent value="blog" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-700" /> Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No blog posts found</div>
              ) : (
                <div className="space-y-4">
                  {blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{post.title}</h3>
                        <p className="text-sm text-gray-600">{post.excerpt}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.viewCount.toLocaleString()} views
                          </span>
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                          {post.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditContent(post, "blog")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteContent(post.id, "blog")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonials Tab */}
        <TabsContent value="testimonials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-700" /> Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : testimonials.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No testimonials found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{testimonial.authorName}</div>
                          <div className="text-sm text-gray-500">
                            {testimonial.authorTitle} {testimonial.authorCompany && `at ${testimonial.authorCompany}`}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {testimonial.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(testimonial.status)}>
                            {testimonial.status}
                          </Badge>
                          {testimonial.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditContent(testimonial, "testimonial")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteContent(testimonial.id, "testimonial")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-700" /> Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No resources found</div>
              ) : (
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{resource.title}</h3>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          {resource.fileType && <span>{resource.fileType}</span>}
                          {resource.fileSize && <span>{formatFileSize(resource.fileSize)}</span>}
                          <span>{resource.downloadCount} downloads</span>
                          <Badge className={resource.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {resource.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {resource.category && (
                            <Badge variant="outline">{resource.category}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {resource.fileUrl && (
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditContent(resource, "resource")}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeleteContent(resource.id, "resource")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? "Edit" : "Create"} {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <ContentEditor
            type={contentType}
            initialData={editingContent}
            onSave={handleSaveContent}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 