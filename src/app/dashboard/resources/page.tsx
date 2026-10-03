import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Mail } from "lucide-react"

export const dynamic = "force-dynamic"

const OFFICE_EMAIL = "info@businessassociationsa.com"

const isWebLink = (url: string | null): url is string => !!url && /^https?:\/\//i.test(url)

/**
 * Member resources: whatever staff have published as active `Resource` rows
 * (the same list `GET /api/resources` returns). No placeholder content.
 */
export default async function ResourcesPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/dashboard/resources")

  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      fileUrl: true,
      fileType: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600 mt-2">Documents and links shared with BASA members</p>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <FileText className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-gray-700">
              Member resources are coming soon. Contact the office for membership materials,
              event information or help with your listing.
            </p>
            <Button asChild variant="outline">
              <a href={`mailto:${OFFICE_EMAIL}`}>
                <Mail className="w-4 h-4 mr-2" />
                {OFFICE_EMAIL}
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map(r => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  {r.category && <Badge variant="secondary">{r.category}</Badge>}
                  {r.fileType && <Badge variant="outline">{r.fileType}</Badge>}
                </div>
                <CardTitle className="text-lg">{r.title}</CardTitle>
                {r.description && <CardDescription>{r.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {isWebLink(r.fileUrl) ? (
                  <Button asChild size="sm">
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">Ask the office for a copy.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
