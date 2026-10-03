'use client'

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import type { MembershipTier } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Building2, Target, Star, Loader2 } from "lucide-react"
import { BasaMemberLoading } from "@/components/ui/basa-loading"
import { TIERS_IN_ORDER, tierLabel } from "@/lib/membership-tiers"

interface DirectoryMember {
  id: string
  businessName: string | null
  businessType: string | null
  industry: string[]
  city: string | null
  state: string | null
  membershipTier: MembershipTier | null
  joinedAt: string
  user: { firstName: string | null; lastName: string | null }
}

interface Pagination {
  page: number
  total: number
  hasNextPage: boolean
}

const PAGE_SIZE = 24

const SORTS = {
  recent: { sortBy: "joinedAt", sortOrder: "desc", label: "Newest members" },
  name: { sortBy: "lastName", sortOrder: "asc", label: "Name A-Z" },
  company: { sortBy: "businessName", sortOrder: "asc", label: "Company A-Z" },
} as const
type SortKey = keyof typeof SORTS

/** Value that settles `delay` ms after the last change. */
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function DirectoryPage() {
  const { data: session, status } = useSession()
  const isGuest = session?.user?.role === "GUEST"

  const [searchTerm, setSearchTerm] = useState("")
  const [city, setCity] = useState("")
  const [tier, setTier] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("recent")

  const search = useDebounced(searchTerm.trim())
  const cityFilter = useDebounced(city.trim())

  const [members, setMembers] = useState<DirectoryMember[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Only the latest request may update the list (typing fires several).
  const requestId = useRef(0)

  const load = useCallback(async (page: number) => {
    const id = ++requestId.current
    const params = new URLSearchParams({
      scope: "directory",
      page: String(page),
      limit: String(PAGE_SIZE),
      sortBy: SORTS[sort].sortBy,
      sortOrder: SORTS[sort].sortOrder,
    })
    if (search) params.set("search", search)
    if (cityFilter) params.set("city", cityFilter)
    if (tier !== "all") params.set("membershipTier", tier)

    if (page === 1) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    try {
      const response = await fetch(`/api/members?${params}`)
      if (id !== requestId.current) return
      if (response.status === 403) {
        setError("The member directory is available to active members.")
        setMembers([])
        setPagination(null)
        return
      }
      if (!response.ok) throw new Error(String(response.status))
      const data: { members: DirectoryMember[]; pagination: Pagination } = await response.json()
      if (id !== requestId.current) return
      setMembers(prev => (page === 1 ? data.members : [...prev, ...data.members]))
      setPagination(data.pagination)
    } catch {
      if (id === requestId.current) setError("Could not load the directory. Please try again.")
    } finally {
      if (id === requestId.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [search, cityFilter, tier, sort])

  useEffect(() => {
    if (status === "loading") return
    if (isGuest) {
      setLoading(false)
      return
    }
    load(1)
  }, [load, status, isGuest])

  if (isGuest) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-gray-700">
              The member directory is for BASA members. Your membership isn&apos;t active.
            </p>
            <Button asChild>
              <Link href="/membership">View membership levels</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
        <p className="text-gray-600 mt-2">
          {pagination
            ? `${pagination.total} ${pagination.total === 1 ? "member" : "members"} listed`
            : "BASA members who have chosen to be listed"}
          {". "}
          Choose what you share on your <Link href="/dashboard/account" className="underline">account page</Link>.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or company..."
                  aria-label="Search members"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Input
                placeholder="City"
                aria-label="Filter by city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger aria-label="Membership level">
                  <SelectValue placeholder="Membership level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {TIERS_IN_ORDER.map(t => (
                    <SelectItem key={t.tier} value={t.tier}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger aria-label="Sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SORTS) as SortKey[]).map(key => (
                    <SelectItem key={key} value={key}>{SORTS[key].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Grid */}
      <div>
        {loading ? (
          <BasaMemberLoading />
        ) : error ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-gray-700">{error}</p>
            <Button variant="outline" onClick={() => load(1)}>Try again</Button>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No members found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => {
              const name = [member.user.firstName, member.user.lastName].filter(Boolean).join(" ") || member.businessName || "BASA member"
              return (
                <Card key={member.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-lg">{name}</CardTitle>
                          {member.businessType && <CardDescription>{member.businessType}</CardDescription>}
                        </div>
                      </div>
                      {member.membershipTier && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-800 shrink-0">
                          {tierLabel(member.membershipTier)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {member.businessName && member.businessName !== name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          {member.businessName}
                        </div>
                      )}
                      {member.city && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {member.city}{member.state && `, ${member.state}`}
                        </div>
                      )}
                      {member.industry.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Target className="w-4 h-4 mr-2" />
                          {member.industry.slice(0, 2).join(", ")}
                          {member.industry.length > 2 && "..."}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2" />
                        Member since {new Date(member.joinedAt).getFullYear()}
                      </div>
                    </div>
                    <Button asChild size="sm" className="w-full mt-4">
                      <Link href={`/dashboard/directory/profile/${member.id}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loading && !error && pagination?.hasNextPage && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              disabled={loadingMore}
              onClick={() => load(pagination.page + 1)}
            >
              {loadingMore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Load more members ({members.length} of {pagination.total})
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
