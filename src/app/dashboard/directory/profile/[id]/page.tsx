'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { MembershipTier } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Target,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Crown,
} from "lucide-react"
import { tierLabel } from "@/lib/membership-tiers"
import { EVENT_TIME_ZONE } from "@/lib/event-time"

interface MemberProfile {
  id: string
  userId: string
  businessName: string | null
  businessType: string | null
  industry: string[]
  businessEmail: string | null
  businessPhone: string | null
  businessAddress: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  website: string | null
  membershipTier: MembershipTier | null
  joinedAt: string
  description: string | null
  tagline: string | null
  specialties: string[]
  certifications: string[]
  linkedin: string | null
  facebook: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  user: { firstName: string | null; lastName: string | null; email: string | null }
  eventRegistrations: { id: string; event: { id: string; title: string; startDate: string } }[]
}

/** Only http(s) links are rendered; anything else (e.g. javascript:) is dropped. */
const webLink = (url: string | null | undefined) => (url && /^https?:\/\//i.test(url) ? url : null)

export default function MemberProfilePage() {
  const params = useParams()
  const memberId = params.id as string
  const [member, setMember] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!memberId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const response = await fetch(`/api/members/${encodeURIComponent(memberId)}`)
        if (cancelled) return
        if (response.status === 403) {
          setError("The member directory is available to active members.")
        } else if (response.status === 404) {
          setError("This member is not listed in the directory.")
        } else if (!response.ok) {
          setError("Could not load this profile. Please try again.")
        } else {
          setMember(await response.json())
        }
      } catch {
        if (!cancelled) setError("Could not load this profile. Please try again.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [memberId])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading member profile...</p>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-700">{error || "Member not found"}</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/directory">Back to Directory</Link>
        </Button>
      </div>
    )
  }

  const name = [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") || member.businessName || "BASA member"
  const email = member.businessEmail || member.user.email
  const website = webLink(member.website)
  const address = [member.businessAddress, [member.city, member.state].filter(Boolean).join(", "), member.zipCode]
    .filter(Boolean)
    .join(" ")
  const socials = [
    { url: webLink(member.linkedin), label: "LinkedIn", Icon: Linkedin },
    { url: webLink(member.facebook), label: "Facebook", Icon: Facebook },
    { url: webLink(member.instagram), label: "Instagram", Icon: Instagram },
    { url: webLink(member.twitter), label: "X (Twitter)", Icon: Twitter },
    { url: webLink(member.youtube), label: "YouTube", Icon: Youtube },
  ].filter(s => s.url)
  const hasContact = !!(email || member.businessPhone || website)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
        <Button asChild variant="ghost" size="sm" className="self-start">
          <Link href="/dashboard/directory">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
          {member.businessName && member.businessName !== name && (
            <p className="text-gray-600 mt-1">{member.businessName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Business Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {member.businessName && <h3 className="font-semibold text-lg">{member.businessName}</h3>}
                  {member.businessType && <p className="text-gray-600">{member.businessType}</p>}
                </div>
                <div className="sm:text-right">
                  <Badge variant="outline" className="mb-2">
                    <Crown className="w-3 h-3 mr-1" />
                    {tierLabel(member.membershipTier)}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Member since {new Date(member.joinedAt).getFullYear()}
                  </p>
                </div>
              </div>

              {member.tagline && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-800 italic">&ldquo;{member.tagline}&rdquo;</p>
                </div>
              )}

              {member.description && (
                <div>
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-gray-700 whitespace-pre-line">{member.description}</p>
                </div>
              )}

              {address && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 shrink-0" />
                  <span>{address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(member.industry.length > 0 || member.specialties.length > 0 || member.certifications.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Industry &amp; Specialties</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {member.industry.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Industries</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.industry.map(i => <Badge key={i} variant="secondary">{i}</Badge>)}
                    </div>
                  </div>
                )}
                {member.specialties.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                    </div>
                  </div>
                )}
                {member.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.certifications.map(c => (
                        <Badge key={c} variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                          <Award className="w-3 h-3 mr-1" />
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {member.eventRegistrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span>Recent BASA Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {member.eventRegistrations.slice(0, 5).map(r => (
                  <div key={r.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm">{r.event.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(r.event.startDate).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: EVENT_TIME_ZONE })}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasContact ? (
                <>
                  {email && (
                    <a href={`mailto:${email}`} className="flex items-center text-sm text-blue-600 hover:underline break-all">
                      <Mail className="w-4 h-4 mr-2 shrink-0 text-gray-500" />
                      {email}
                    </a>
                  )}
                  {member.businessPhone && (
                    <a href={`tel:${member.businessPhone.replace(/[^\d+]/g, "")}`} className="flex items-center text-sm text-blue-600 hover:underline">
                      <Phone className="w-4 h-4 mr-2 shrink-0 text-gray-500" />
                      {member.businessPhone}
                    </a>
                  )}
                  {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline break-all">
                      <Globe className="w-4 h-4 mr-2 shrink-0 text-gray-500" />
                      {website.replace(/^https?:\/\//i, "")}
                    </a>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">This member has chosen not to display contact information.</p>
              )}
            </CardContent>
          </Card>

          {socials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {socials.map(({ url, label, Icon }) => (
                  <a key={label} href={url!} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
