'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Handshake,
  Star,
  Award,
  Target,
  MessageSquare,
  Bookmark,
  Share2,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Crown,
  Clock,
  TrendingUp
} from "lucide-react"
import { useMembers } from "@/hooks/use-members"

export default function MemberProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const { fetchMember, loading } = useMembers()
  const [member, setMember] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const memberId = params.id as string

  useEffect(() => {
    async function loadMember() {
      try {
        const memberData = await fetchMember(memberId)
        setMember(memberData)
      } catch (err) {
        setError('Failed to load member profile')
      }
    }
    
    if (memberId) {
      loadMember()
    }
  }, [memberId, fetchMember])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading member profile...</p>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error || 'Member not found'}</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/directory">Back to Directory</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check if current user is viewing their own profile
  const isOwnProfile = session?.user?.id === member.userId

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/directory">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {member.user.firstName} {member.user.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{member.businessName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4 mr-2" />
            Save Contact
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          {!isOwnProfile && (
            <Button asChild>
              <Link href={`/dashboard/directory/connect/${member.id}`}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Connect
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <span>Business Information</span>
                </CardTitle>
                <Badge variant="secondary" className={getStatusBadgeColor(member.membershipStatus)}>
                  {member.membershipStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{member.businessName}</h3>
                  <p className="text-gray-600">{member.businessType}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    <Crown className="w-3 h-3 mr-1" />
                    {member.membershipTier} Member
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Member since {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {member.description && (
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-gray-700">{member.description}</p>
                </div>
              )}

              {member.tagline && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 italic">"{member.tagline}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.city && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{member.city}{member.state && `, ${member.state}`}</span>
                  </div>
                )}
                {member.businessPhone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{member.businessPhone}</span>
                  </div>
                )}
                {member.businessEmail && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{member.businessEmail}</span>
                  </div>
                )}
                {member.website && (
                  <div className="flex items-center text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {member.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Industry & Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Industry & Specialties</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.industry.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Industries</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.industry.map((industry: string) => (
                      <Badge key={industry} variant="secondary">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {member.specialties && member.specialties.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {member.certifications && member.certifications.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.certifications.map((cert: string) => (
                      <Badge key={cert} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                        <Award className="w-3 h-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {member.eventRegistrations && member.eventRegistrations.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium mb-3">Recent Events Attended</h4>
                  {member.eventRegistrations.slice(0, 5).map((registration: any) => (
                    <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{registration.event.title}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(registration.event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {registration.event.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity to show</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.allowContact ? (
                <>
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">{member.businessEmail || member.user.email}</span>
                  </div>
                  {member.businessPhone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">{member.businessPhone}</span>
                    </div>
                  )}
                  {member.website && (
                    <div className="flex items-center text-sm">
                      <Globe className="w-4 h-4 mr-2 text-gray-500" />
                      <a href={member.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                  {!isOwnProfile && (
                    <Button asChild className="w-full mt-4">
                      <Link href={`/dashboard/directory/connect/${member.id}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">This member has chosen not to display contact information</p>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Networking Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm">Events Attended</span>
                </div>
                <span className="font-semibold">{member.eventRegistrations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Handshake className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm">Connections</span>
                </div>
                <span className="font-semibold">
                  {(member.referralsGiven?.length || 0) + (member.referralsReceived?.length || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-purple-600" />
                  <span className="text-sm">Member Since</span>
                </div>
                <span className="font-semibold text-sm">
                  {new Date(member.joinedAt).getFullYear()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          {(member.linkedin || member.facebook || member.instagram || member.twitter || member.youtube) && (
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                )}
                {member.facebook && (
                  <a href={member.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </a>
                )}
                {member.instagram && (
                  <a href={member.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </a>
                )}
                {member.twitter && (
                  <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                )}
                {member.youtube && (
                  <a href={member.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Youtube className="w-4 h-4 mr-2" />
                    YouTube
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Bookmark className="w-4 h-4 mr-2" />
                Save to Contacts
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </Button>
              {!isOwnProfile && (
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800'
    case 'SUSPENDED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
} 