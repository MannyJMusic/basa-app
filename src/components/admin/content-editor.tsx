"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  X, 
  Plus,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3
} from "lucide-react"

// Validation schemas
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().url().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  tags: z.array(z.string()),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isFeatured: z.boolean(),
})

const testimonialSchema = z.object({
  authorName: z.string().min(1, "Author name is required"),
  authorTitle: z.string().optional(),
  authorCompany: z.string().optional(),
  authorImage: z.string().url().optional(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().min(1).max(5),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  isFeatured: z.boolean(),
  memberId: z.string().optional(),
})

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.string().optional(),
  fileSize: z.number().optional(),
  isActive: z.boolean(),
  category: z.string().optional(),
  tags: z.array(z.string()),
  memberId: z.string().optional(),
})

type ContentType = "blog" | "testimonial" | "resource"
type BlogPostFormData = z.infer<typeof blogPostSchema>
type TestimonialFormData = z.infer<typeof testimonialSchema>
type ResourceFormData = z.infer<typeof resourceSchema>

interface ContentEditorProps {
  type: ContentType
  initialData?: any
  onSave?: (data: any) => void
  onCancel?: () => void
}

export function ContentEditor({ type, initialData, onSave, onCancel }: ContentEditorProps) {
  const [activeTab, setActiveTab] = useState("content")
  const [isPreview, setIsPreview] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Blog post form
  const blogForm = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      featuredImage: initialData?.featuredImage || "",
      status: initialData?.status || "DRAFT",
      tags: initialData?.tags || [],
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      isFeatured: initialData?.isFeatured || false,
    },
  })

  // Testimonial form
  const testimonialForm = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      authorName: initialData?.authorName || "",
      authorTitle: initialData?.authorTitle || "",
      authorCompany: initialData?.authorCompany || "",
      authorImage: initialData?.authorImage || "",
      content: initialData?.content || "",
      rating: initialData?.rating || 5,
      status: initialData?.status || "PENDING",
      isFeatured: initialData?.isFeatured || false,
      memberId: initialData?.memberId || "",
    },
  })

  // Resource form
  const resourceForm = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      fileUrl: initialData?.fileUrl || "",
      fileType: initialData?.fileType || "",
      fileSize: initialData?.fileSize || 0,
      isActive: initialData?.isActive ?? true,
      category: initialData?.category || "",
      tags: initialData?.tags || [],
      memberId: initialData?.memberId || "",
    },
  })

  const currentForm = type === "blog" ? blogForm : type === "testimonial" ? testimonialForm : resourceForm

  const addTag = (tag: string) => {
    if (type === "blog" || type === "resource") {
      const formValues = currentForm.getValues() as { tags?: string[] };
      const tags = formValues.tags || [];
      if (tag && !tags.includes(tag)) {
        (currentForm as any).setValue("tags", [...tags, tag]);
        setNewTag("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (type === "blog" || type === "resource") {
      const formValues = currentForm.getValues() as { tags?: string[] };
      const tags = formValues.tags || [];
      (currentForm as any).setValue(
        "tags",
        tags.filter((tag: string) => tag !== tagToRemove)
      );
    }
  };

  const handleSave = async (data: any) => {
    setIsLoading(true)
    try {
      if (onSave) {
        await onSave(data)
      }
      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = currentForm.handleSubmit(handleSave)

  // Rich text editor toolbar
  const RichTextToolbar = () => (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
      <Button size="sm" variant="ghost" type="button">
        <Bold className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <Italic className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" variant="ghost" type="button">
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <Heading2 className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <Heading3 className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" variant="ghost" type="button">
        <List className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <ListOrdered className="w-4 h-4" />
      </Button>
      <Separator orientation="vertical" className="h-6" />
      <Button size="sm" variant="ghost" type="button">
        <Quote className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <Link className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <ImageIcon className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button">
        <Code className="w-4 h-4" />
      </Button>
    </div>
  )

  const renderBlogForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...blogForm.register("title")}
            placeholder="Enter post title"
          />
          {blogForm.formState.errors.title && (
            <p className="text-sm text-red-600">{blogForm.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            {...blogForm.register("slug")}
            placeholder="post-url-slug"
          />
          {blogForm.formState.errors.slug && (
            <p className="text-sm text-red-600">{blogForm.formState.errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          {...blogForm.register("excerpt")}
          placeholder="Brief description of the post"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="featuredImage">Featured Image URL</Label>
        <Input
          id="featuredImage"
          {...blogForm.register("featuredImage")}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <div className="border rounded-lg">
          <RichTextToolbar />
          <Textarea
            {...blogForm.register("content")}
            placeholder="Write your content here..."
            className="border-0 focus-visible:ring-0 min-h-[300px] resize-none"
            rows={15}
          />
        </div>
        {blogForm.formState.errors.content && (
          <p className="text-sm text-red-600">{blogForm.formState.errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={blogForm.watch("status")}
            onValueChange={(value) => blogForm.setValue("status", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="isFeatured">Featured Post</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={blogForm.watch("isFeatured")}
              onCheckedChange={(checked) => blogForm.setValue("isFeatured", checked)}
            />
            <Label htmlFor="isFeatured">Mark as featured</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(newTag))}
          />
          <Button type="button" onClick={() => addTag(newTag)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {blogForm.watch("tags").map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </form>
  )

  const renderTestimonialForm = () => (
    <form onSubmit={testimonialForm.handleSubmit(handleSave)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="authorName">Author Name</Label>
          <Input
            id="authorName"
            {...testimonialForm.register("authorName")}
            placeholder="Enter author name"
          />
          {testimonialForm.formState.errors.authorName && (
            <p className="text-sm text-red-600">{testimonialForm.formState.errors.authorName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorTitle">Author Title</Label>
          <Input
            id="authorTitle"
            {...testimonialForm.register("authorTitle")}
            placeholder="e.g., CEO, Director"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="authorCompany">Company</Label>
        <Input
          id="authorCompany"
          {...testimonialForm.register("authorCompany")}
          placeholder="Company name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="authorImage">Author Image URL</Label>
        <Input
          id="authorImage"
          {...testimonialForm.register("authorImage")}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Testimonial Content</Label>
        <Textarea
          id="content"
          {...testimonialForm.register("content")}
          placeholder="Enter the testimonial content..."
          rows={6}
        />
        {testimonialForm.formState.errors.content && (
          <p className="text-sm text-red-600">{testimonialForm.formState.errors.content.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating</Label>
          <Select
            value={testimonialForm.watch("rating").toString()}
            onValueChange={(value) => testimonialForm.setValue("rating", parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((rating) => (
                <SelectItem key={rating} value={rating.toString()}>
                  {rating} Star{rating !== 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={testimonialForm.watch("status")}
            onValueChange={(value) => testimonialForm.setValue("status", value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="isFeatured">Featured</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={testimonialForm.watch("isFeatured")}
              onCheckedChange={(checked) => testimonialForm.setValue("isFeatured", checked)}
            />
            <Label htmlFor="isFeatured">Mark as featured</Label>
          </div>
        </div>
      </div>
    </form>
  )

  const renderResourceForm = () => (
    <form onSubmit={resourceForm.handleSubmit(handleSave)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Resource Title</Label>
        <Input
          id="title"
          {...resourceForm.register("title")}
          placeholder="Enter resource title"
        />
        {resourceForm.formState.errors.title && (
          <p className="text-sm text-red-600">{resourceForm.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...resourceForm.register("description")}
          placeholder="Describe the resource..."
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fileUrl">File URL</Label>
          <Input
            id="fileUrl"
            {...resourceForm.register("fileUrl")}
            placeholder="https://example.com/file.pdf"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            {...resourceForm.register("category")}
            placeholder="e.g., Templates, Guides"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fileType">File Type</Label>
          <Input
            id="fileType"
            {...resourceForm.register("fileType")}
            placeholder="e.g., PDF, DOCX"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileSize">File Size (bytes)</Label>
          <Input
            id="fileSize"
            type="number"
            {...resourceForm.register("fileSize", { valueAsNumber: true })}
            placeholder="1024000"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag(newTag))}
          />
          <Button type="button" onClick={() => addTag(newTag)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {resourceForm.watch("tags").map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="isActive">Active</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={resourceForm.watch("isActive")}
            onCheckedChange={(checked) => resourceForm.setValue("isActive", checked)}
          />
          <Label htmlFor="isActive">Resource is active</Label>
        </div>
      </div>
    </form>
  )

  const renderForm = () => {
    switch (type) {
      case "blog":
        return renderBlogForm()
      case "testimonial":
        return renderTestimonialForm()
      case "resource":
        return renderResourceForm()
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {initialData ? "Edit" : "Create"} {type.charAt(0).toUpperCase() + type.slice(1)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isPreview ? "Hide Preview" : "Preview"}
            </Button>
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6">
            {renderForm()}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Settings</h3>
              <p className="text-gray-600">Additional settings and metadata for your content.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="seo" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO Settings</h3>
              <p className="text-gray-600">Optimize your content for search engines.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 