"use client"
import { useEffect } from "react"

export function MarkApplicationsRead({ orgSlug }: { orgSlug: string }) {
  useEffect(() => {
    fetch(`/api/orgs/${orgSlug}/applications/mark-read`, { method: "POST" })
      .catch(() => {})
  }, [orgSlug])
  return null
}
