'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, MapPin, Users, Star, Filter, Search } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'

export default function EventsListPage() {
  const { events, loading, fetchEvents } = useEvents()
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')

  useEffect(() => {
    fetchEvents({ status: "PUBLISHED" })
      .catch(error => {
        console.error('Error fetching events:', error)
      })
  }, [fetchEvents])

  useEffect(() => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(event => event.type === selectedType)
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, selectedType])

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-linear-to-r from-purple-900 to-purple-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 mr-4">
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Event Directory
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse All Events
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Discover networking opportunities and community events.
            </p>
          </div>
        </div>
      </section>
      
      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  placeholder="Search events..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="NETWORKING">Networking</option>
                  <option value="RIBBON_CUTTING">Ribbon Cutting</option>
                  <option value="SUMMIT">Summit</option>
                  <option value="COMMUNITY">Community</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No events found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedType('')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                    <CardHeader className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                      <div className="flex items-center justify-between">
                        {event.isFeatured && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            Featured Event
                          </Badge>
                        )}
                        <div className="text-sm opacity-90">
                          {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                      <CardTitle className="text-2xl">
                        <Link 
                          href={`/events/${event.slug}`}
                          className="hover:text-blue-200 transition-colors duration-200"
                        >
                          {event.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-blue-100">
                        {event.shortDescription || event.description?.slice(0, 100) + '...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-3 text-purple-600" />
                            <span>{new Date(event.startDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(event.endDate).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-3 text-purple-600" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Users className="w-4 h-4 mr-3 text-purple-600" />
                            <span>Capacity: {event.capacity || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-2">
                            <Star className="inline w-4 h-4 mr-1" /> Pricing
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Member Price:</span>
                              <span className="font-semibold text-green-700">${(Number(event.memberPrice) || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Non-Member Price:</span>
                              <span className="font-semibold">${(Number(event.price) || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                          <Link href={`/events/${event.slug}/register`}>Register Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
} 