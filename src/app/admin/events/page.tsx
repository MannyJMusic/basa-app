'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign,
  Star,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  Building,
  Layers
} from 'lucide-react'
import { useEvents, Event, CreateEventData, EventFilters } from '@/hooks/use-events'
import { EventDetailDialog } from '@/components/events/event-detail-dialog'
import { FlyerUpload, type FlyerDraft } from '@/components/admin/flyer-upload'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { DraftTiersEditor } from '@/components/admin/draft-tiers-editor'
import { ImageDropzone } from '@/components/admin/image-dropzone'
import { EventImage } from '@/components/events/event-image'
import { deriveTiers, type TierDraft } from '@/lib/flyer-draft'
import { fieldsToUpdate } from '@/lib/flyer-batch'
import type { DuplicateMatch } from '@/lib/event-duplicates'
import { DashboardTableLoading } from '@/components/ui/dashboard-loading'

export default function AdminEventsPage() {
  const {
    loading,
    events,
    pagination,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    exportEvents,
  } = useEvents()

  const [organizers, setOrganizers] = useState<Array<{ id: string; name: string }>>([])
  const [venues, setVenues] = useState<Array<{ id: string; name: string; address?: string | null; city?: string | null; state?: string | null; zipCode?: string | null }>>([])
  const [tiers, setTiers] = useState<TierDraft[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<EventFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('startDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Form state for creating events
  const [createFormData, setCreateFormData] = useState<CreateEventData>({
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    capacity: undefined,
    price: undefined,
    memberPrice: undefined,
    category: '',
    type: 'NETWORKING',
    status: 'DRAFT',
    isFeatured: false,
    image: '',
    organizerId: '',
    venueId: '',
    tags: [],
  })

  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  // Events already on that date with a like title; shown instead of creating a second one.
  const [duplicates, setDuplicates] = useState<DuplicateMatch[] | null>(null)

  // A flyer draft only fills the form; the admin still reviews and clicks Create (#69).
  const applyFlyerDraft = (draft: FlyerDraft) => {
    setCreateError(null)
    setCreateFormData(prev => ({ ...prev, ...draft.fields }))
    setTiers(draft.tiers)
  }

  // Choosing a saved venue copies its address into the form.
  const chooseVenue = (id: string) => {
    if (id === 'none') { setCreateFormData(prev => ({ ...prev, venueId: '' })); return }
    const v = venues.find(x => x.id === id)
    if (!v) return
    setCreateFormData(prev => ({
      ...prev, venueId: v.id, location: v.name,
      address: v.address ?? '', city: v.city ?? '', state: v.state ?? '', zipCode: v.zipCode ?? '',
    }))
  }

  useEffect(() => {
    fetchEvents(filters, currentPage, 20, sortBy, sortOrder)
  }, [fetchEvents, filters, currentPage, sortBy, sortOrder])

  // Organizers only populate the create form, so load them once rather than on
  // every filter, page, or sort change.
  useEffect(() => {
    fetch('/api/organizers')
      .then(r => (r.ok ? r.json() : []))
      .then(setOrganizers)
      .catch(() => setOrganizers([]))
    fetch('/api/venues')
      .then(r => (r.ok ? r.json() : []))
      .then(setVenues)
      .catch(() => setVenues([]))
  }, [])

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleCreateEvent = async (allowDuplicate = false) => {
    setCreateLoading(true)
    setCreateError(null)
    setDuplicates(null)

    // Client-side validation
    const requiredFields = {
      title: createFormData.title,
      slug: createFormData.slug,
      description: createFormData.description,
      startDate: createFormData.startDate,
      endDate: createFormData.endDate,
      location: createFormData.location,
      category: createFormData.category,
    }

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([field]) => field)

    if (missingFields.length > 0) {
      setCreateError(`Missing required fields: ${missingFields.join(', ')}`)
      setCreateLoading(false)
      return
    }

    // Validate dates
    if (new Date(createFormData.startDate) >= new Date(createFormData.endDate)) {
      setCreateError('End date must be after start date')
      setCreateLoading(false)
      return
    }

    try {
      // BASA runs its own events; only send an organizer when one was picked.
      // Tickets: what is on the form, else the price / member price pair.
      const ticketTiers = (tiers.length > 0
        ? tiers
        : deriveTiers({ ticketTiers: [], price: createFormData.price ?? null, memberPrice: createFormData.memberPrice ?? null })
      ).filter(t => t.name.trim() && Number.isFinite(t.price))
      await createEvent({
        ...createFormData,
        organizerId: createFormData.organizerId || undefined,
        venueId: createFormData.venueId || undefined,
        autoVenue: !createFormData.venueId,
        image: createFormData.image || undefined,
        ticketTiers,
        allowDuplicate,
      } as CreateEventData)
      setShowCreateDialog(false)
      setTiers([])
      setCreateFormData({
        title: '',
        slug: '',
        description: '',
        shortDescription: '',
        startDate: '',
        endDate: '',
        location: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        capacity: undefined,
        price: undefined,
        memberPrice: undefined,
        category: '',
        type: 'NETWORKING',
        status: 'DRAFT',
        isFeatured: false,
        image: '',
        organizerId: '',
        venueId: '',
        tags: [],
      })
      fetchEvents(filters, currentPage, 20, sortBy, sortOrder)
    } catch (error) {
      const found = error instanceof Error ? (error as Error & { duplicates?: DuplicateMatch[] }).duplicates : undefined
      if (found?.length) setDuplicates(found)
      else setCreateError(error instanceof Error ? error.message : 'Failed to create event')
    } finally {
      setCreateLoading(false)
    }
  }

  // The flyer was a re-issue of an event that exists: apply it there instead.
  const updateExisting = async (match: DuplicateMatch) => {
    setCreateLoading(true)
    setCreateError(null)
    try {
      await updateEvent(match.id, fieldsToUpdate(createFormData))
      setDuplicates(null)
      setShowCreateDialog(false)
      setTiers([])
      fetchEvents(filters, currentPage, 20, sortBy, sortOrder)
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to update event')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      await exportEvents(filters)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-gray-600">Manage BASA events and registrations</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/events/batch"><Layers className="w-4 h-4 mr-2" />Batch from flyers</Link>
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to the BASA calendar
                </DialogDescription>
              </DialogHeader>

              {duplicates && (
                <Alert className="border-amber-300 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="space-y-3 text-amber-900">
                    <p className="font-medium">
                      {duplicates.length === 1 ? 'This event looks like one already on the calendar for that day:' : 'These events are already on the calendar for that day:'}
                    </p>
                    <ul className="space-y-2">
                      {duplicates.map(d => (
                        <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white/70 p-2 text-sm">
                          <span>
                            <strong>{d.title}</strong> · {new Date(d.startDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' })} · {d.status.toLowerCase()}
                            {d.level === 'likely' && <span className="text-amber-700"> (similar title)</span>}
                          </span>
                          <Button type="button" size="sm" disabled={createLoading} onClick={() => updateExisting(d)}>
                            Update this event with the flyer
                          </Button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" disabled={createLoading} onClick={() => handleCreateEvent(true)}>
                        It is a different event, create it anyway
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setDuplicates(null)}>Dismiss</Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {createError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {createError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <FlyerUpload onDraft={applyFlyerDraft} disabled={createLoading} />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={createFormData.title}
                      onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                      placeholder="Enter event title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={createFormData.slug}
                      onChange={(e) => setCreateFormData({ ...createFormData, slug: e.target.value })}
                      placeholder="event-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <RichTextEditor
                    id="description"
                    value={createFormData.description}
                    onChange={(html) => setCreateFormData(prev => ({ ...prev, description: html }))}
                    placeholder="Tagline, a warm intro, Event Details, Pricing, what to expect, how to register…"
                  />
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    value={createFormData.shortDescription}
                    onChange={(e) => setCreateFormData({ ...createFormData, shortDescription: e.target.value })}
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
                      value={createFormData.startDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={createFormData.endDate}
                      onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="venue">Saved venue <span className="text-gray-400 font-normal">(or type a new one below; it will be saved)</span></Label>
                  <Select value={createFormData.venueId || 'none'} onValueChange={chooseVenue}>
                    <SelectTrigger id="venue"><SelectValue placeholder="Choose a saved venue" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">New or unlisted venue</SelectItem>
                      {venues.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={createFormData.location}
                      onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                      placeholder="Event location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={createFormData.city}
                      onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={createFormData.state}
                      onChange={(e) => setCreateFormData({ ...createFormData, state: e.target.value })}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={createFormData.zipCode}
                      onChange={(e) => setCreateFormData({ ...createFormData, zipCode: e.target.value })}
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
                      value={createFormData.capacity || ''}
                      onChange={(e) => setCreateFormData({ ...createFormData, capacity: parseInt(e.target.value) || undefined })}
                      placeholder="Max attendees"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={createFormData.price || ''}
                      onChange={(e) => setCreateFormData({ ...createFormData, price: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memberPrice">Member Price ($)</Label>
                    <Input
                      id="memberPrice"
                      type="number"
                      step="0.01"
                      value={createFormData.memberPrice || ''}
                      onChange={(e) => setCreateFormData({ ...createFormData, memberPrice: parseFloat(e.target.value) || undefined })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label>Ticket types</Label>
                  <p className="text-xs text-gray-500 mb-2">Members and future members are separate tickets. Left empty, they are made from Price and Member Price above.</p>
                  <DraftTiersEditor tiers={tiers} onChange={setTiers} />
                </div>

                {/* Category and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      value={createFormData.category}
                      onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                      placeholder="Event category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Event Type</Label>
                    <Select
                      value={createFormData.type}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      value={createFormData.status}
                      onValueChange={(value) => setCreateFormData({ ...createFormData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      checked={createFormData.isFeatured}
                      onCheckedChange={(checked) => setCreateFormData({ ...createFormData, isFeatured: checked })}
                    />
                    <Label htmlFor="isFeatured">Featured Event</Label>
                  </div>
                </div>

                {/* Organizer */}
                <div>
                  <Label htmlFor="organizer">Organizer <span className="text-gray-400 font-normal">(optional; leave empty for BASA)</span></Label>
                  <Select
                    value={createFormData.organizerId}
                    onValueChange={(value) => setCreateFormData({ ...createFormData, organizerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organizer" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizers.map((organizer) => (
                        <SelectItem key={organizer.id} value={organizer.id}>
                          {organizer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="image">Featured image (the flyer)</Label>
                  <ImageDropzone kind="events" label="the flyer" value={createFormData.image} onChange={(url) => setCreateFormData(prev => ({ ...prev, image: url }))} />
                  <Label htmlFor="image" className="mt-2 block text-xs text-gray-500">Or paste an image URL</Label>
                  <Input
                    id="image"
                    type="url"
                    value={createFormData.image}
                    onChange={(e) => setCreateFormData({ ...createFormData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={createFormData.tags?.join(', ') || ''}
                    onChange={(e) => setCreateFormData({ 
                      ...createFormData, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="networking, business, san-antonio"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleCreateEvent()}
                    disabled={createLoading || !createFormData.title || !createFormData.slug || !createFormData.description}
                  >
                    {createLoading ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 flex-1">
              <div className="relative basis-full sm:basis-auto flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDate">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="capacity">Capacity</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) => handleFilterChange('type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="NETWORKING">Networking</SelectItem>
                    <SelectItem value="SUMMIT">Summit</SelectItem>
                    <SelectItem value="RIBBON_CUTTING">Ribbon Cutting</SelectItem>
                    <SelectItem value="COMMUNITY">Community</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input
                  placeholder="Filter by category"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={filters.isFeatured || false}
                  onCheckedChange={(checked) => handleFilterChange('isFeatured', checked || undefined)}
                />
                <Label htmlFor="featured">Featured only</Label>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <DashboardTableLoading />
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {Object.keys(filters).length > 0 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first event.'
                }
              </p>
              {Object.keys(filters).length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({})
                    setSearchTerm('')
                    setCurrentPage(1)
                  }}
                >
                  Clear filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <EventImage src={event.image ?? event.venue?.image} alt="" className="h-40 w-full object-cover object-top bg-gray-100" />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {event.shortDescription || event.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {event.isFeatured && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Badge className={getTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{event.registrations.length}</span>
                          {event.capacity && (
                            <span className="text-gray-400 ml-1">/ {event.capacity}</span>
                          )}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>
                            {event.price ? `$${event.price}` : 'Free'}
                            {event.memberPrice && event.memberPrice !== event.price && (
                              <span className="text-gray-400 ml-1">(${event.memberPrice})</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">
                          {event.organizer?.name || 'Unknown Organizer'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventDialog(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowEventDialog(true)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} events
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(pagination.page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />
    </div>
  )
} 