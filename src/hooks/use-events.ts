'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/use-toast'

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  shortDescription?: string
  startDate: string
  endDate: string
  location: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  capacity?: number
  price?: number
  memberPrice?: number
  category: string
  type: 'NETWORKING' | 'SUMMIT' | 'RIBBON_CUTTING' | 'COMMUNITY'
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  isFeatured: boolean
  image?: string
  organizerId: string
  tags: string[]
  createdAt: string
  updatedAt: string
  organizer: {
    id: string
    businessName?: string
    user: {
      firstName?: string
      lastName?: string
      email?: string
    }
  }
  registrations: Array<{
    id: string
    status: string
  }>
  speakers: Array<{
    id: string
    name: string
  }>
  sponsors: Array<{
    id: string
    name: string
  }>
}

export interface CreateEventData {
  title: string
  slug: string
  description: string
  shortDescription?: string
  startDate: string
  endDate: string
  location: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  capacity?: number
  price?: number
  memberPrice?: number
  category: string
  type: 'NETWORKING' | 'SUMMIT' | 'RIBBON_CUTTING' | 'COMMUNITY'
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  isFeatured: boolean
  image?: string
  organizerId: string
  tags: string[]
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface EventFilters {
  search?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'
  type?: 'NETWORKING' | 'SUMMIT' | 'RIBBON_CUTTING' | 'COMMUNITY'
  category?: string
  isFeatured?: boolean
}

export interface EventListResponse {
  events: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export function useEvents() {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [pagination, setPagination] = useState<EventListResponse['pagination'] | null>(null)
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null)

  const fetchEvents = useCallback(async (
    filters: EventFilters = {},
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'startDate',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams(
        Object.entries({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
          ...filters,
        })
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      )

      const url = `/api/events?${params}`
      console.log('useEvents: fetching events from', url)
      
      const response = await fetch(url)
      console.log('useEvents: response status', response.status, response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('useEvents: response not ok', errorText)
        throw new Error('Failed to fetch events')
      }

      const data: EventListResponse = await response.json()
      console.log('useEvents: received data', data)
      console.log('useEvents: events count', data.events?.length)
      
      setEvents(data.events)
      setPagination(data.pagination)
      return data
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEvent = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch event')
      }

      const event: Event = await response.json()
      setCurrentEvent(event)
      return event
    } catch (error) {
      console.error('Error fetching event:', error)
      toast({
        title: "Error",
        description: "Failed to fetch event",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const createEvent = useCallback(async (data: CreateEventData) => {
    setLoading(true)
    try {
      console.log('useEvents: creating event with data:', JSON.stringify(data, null, 2))
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('useEvents: create event response status:', response.status, response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('useEvents: create event error:', errorData)
        throw new Error(errorData.error || 'Failed to create event')
      }

      const event: Event = await response.json()
      console.log('useEvents: created event successfully:', event.id)
      
      toast({
        title: "Success",
        description: "Event created successfully",
      })
      return event
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateEvent = useCallback(async (id: string, data: UpdateEventData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }

      const event: Event = await response.json()
      
      // Update the current event if it's the one being updated
      if (currentEvent?.id === id) {
        setCurrentEvent(event)
      }

      // Update the event in the list
      setEvents(prev => prev.map(e => e.id === id ? event : e))

      toast({
        title: "Success",
        description: "Event updated successfully",
      })
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentEvent])

  const deleteEvent = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete event')
      }

      // Remove from events list
      setEvents(prev => prev.filter(e => e.id !== id))
      
      // Clear current event if it's the one being deleted
      if (currentEvent?.id === id) {
        setCurrentEvent(null)
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentEvent])

  const exportEvents = useCallback(async (
    filters: EventFilters = {},
    format: 'csv' | 'json' = 'csv'
  ) => {
    try {
      const params = new URLSearchParams(
        Object.entries({
          format,
          ...filters,
        })
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)])
      )

      const response = await fetch(`/api/events/export?${params}`)
      if (!response.ok) {
        throw new Error('Failed to export events')
      }

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `basa-events-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        return data
      }

      toast({
        title: "Success",
        description: `Events exported successfully as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error('Error exporting events:', error)
      toast({
        title: "Error",
        description: "Failed to export events",
        variant: "destructive",
      })
      throw error
    }
  }, [])

  return {
    loading,
    events,
    pagination,
    currentEvent,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    exportEvents,
  }
} 