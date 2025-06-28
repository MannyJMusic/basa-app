'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Star,
  Edit,
  Save,
  X,
  Trash2,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Tag,
  Image as ImageIcon
} from 'lucide-react'
import { Event, UpdateEventData } from '@/hooks/use-events'
import { useMembers } from '@/hooks/use-members'

interface EventDetailDialogProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (id: string, data: UpdateEventData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: EventDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateEventData>({})
  const [error, setError] = useState<string | null>(null)
  const { members, fetchMembers } = useMembers()

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        slug: event.slug,
        description: event.description,
        shortDescription: event.shortDescription,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        address: event.address,
        city: event.city,
        state: event.state,
        zipCode: event.zipCode,
        capacity: event.capacity,
        price: event.price,
        memberPrice: event.memberPrice,
        category: event.category,
        type: event.type,
        status: event.status,
        isFeatured: event.isFeatured,
        image: event.image,
        organizerId: event.organizerId,
        tags: event.tags,
      })
    }
  }, [event])

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open, fetchMembers])

  const handleSave = async () => {
    if (!event) return

    setLoading(true)
    setError(null)

    try {
      await onUpdate(event.id, formData)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event) return

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      await onDelete(event.id)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NETWORKING': return 'bg-blue-100 text-blue-800'
      case 'SUMMIT': return 'bg-purple-100 text-purple-800'
      case 'RIBBON_CUTTING': return 'bg-orange-100 text-orange-800'
      case 'COMMUNITY': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? 'Edit Event' : event.title}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update event details' : 'View and manage event information'}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="speakers">Speakers</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="event-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter event description"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief description for previews"
                    rows={2}
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state || ''}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode || ''}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                {/* Pricing and Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || undefined })}
                      placeholder="Max attendees"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberPrice">Member Price ($)</Label>
                    <Input
                      id="memberPrice"
                      type="number"
                      step="0.01"
                      value={formData.memberPrice || ''}
                      onChange={(e) => setFormData({ ...formData, memberPrice: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Category and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Event category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NETWORKING">Networking</SelectItem>
                        <SelectItem value="SUMMIT">Summit</SelectItem>
                        <SelectItem value="RIBBON_CUTTING">Ribbon Cutting</SelectItem>
                        <SelectItem value="COMMUNITY">Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status and Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={formData.isFeatured || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    />
                    <Label htmlFor="isFeatured">Featured Event</Label>
                  </div>
                </div>

                {/* Organizer */}
                <div>
                  <Label htmlFor="organizer">Organizer</Label>
                  <Select
                    value={formData.organizerId}
                    onValueChange={(value) => setFormData({ ...formData, organizerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organizer" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.businessName || `${member.user.firstName} ${member.user.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(', ') || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="networking, business, san-antonio"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Event Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Event Information</h3>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      {event.address && (
                        <div className="flex items-center text-sm">
                          <Building className="w-4 h-4 text-gray-500 mr-2" />
                          <span>{event.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      {event.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 text-gray-500 mr-2" />
                        <span>{event.registrations.length} registrations</span>
                        {event.capacity && (
                          <span className="text-gray-400 ml-1">/ {event.capacity}</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                        <span>
                          {event.price ? `$${event.price}` : 'Free'}
                        </span>
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div>
                        <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Tag className="w-4 h-4 mr-2" />
                          Tags
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {event.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Organizer Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Organizer</h3>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {event.organizer.businessName || 
                         `${event.organizer.user.firstName} ${event.organizer.user.lastName}`}
                      </p>
                      <p className="text-sm text-gray-600">{event.organizer.user.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="registrations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Registrations ({event.registrations.length})</h3>
            </div>
            
            {event.registrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No registrations yet
              </div>
            ) : (
              <div className="space-y-2">
                {event.registrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Registration #{registration.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">Status: {registration.status}</p>
                      </div>
                    </div>
                    <Badge className={registration.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {registration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="speakers" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Speakers ({event.speakers.length})</h3>
            </div>
            
            {event.speakers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No speakers assigned
              </div>
            ) : (
              <div className="space-y-2">
                {event.speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{speaker.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sponsors ({event.sponsors.length})</h3>
            </div>
            
            {event.sponsors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sponsors assigned
              </div>
            ) : (
              <div className="space-y-2">
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Building className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{sponsor.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 