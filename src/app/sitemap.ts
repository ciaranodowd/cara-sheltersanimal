import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const BASE_URL = "https://carashelters.ie"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const orgs = await prisma.organization.findMany({
    select: { slug: true, updatedAt: true },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/adopt`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ]

  const portalRoutes: MetadataRoute.Sitemap = orgs.map(org => ({
    url: `${BASE_URL}/portal/${org.slug}`,
    lastModified: org.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...portalRoutes]
}
