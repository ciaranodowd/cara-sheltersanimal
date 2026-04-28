"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function BillingUpgradePage({ params }: { params: { orgSlug: string } }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(`/${params.orgSlug}/billing`)
  }, [params.orgSlug, router])
  return null
}
