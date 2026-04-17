"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const FEATURES = [
  "Unlimited animals & intake records",
  "Full adoption workflow & contracts",
  "Foster management & portal",
  "Public adoption portal for your shelter",
  "Team management with role-based access",
  "Email templates & donor tracking",
  "GDPR tools & reports",
]

export default function BillingUpgradePage({
  params,
}: {
  params: { orgSlug: string }
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubscribe() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/orgs/${params.orgSlug}/billing/checkout`, {
        method: "POST",
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setLoading(false); return }
      window.location.href = data.url
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Get started with Cara</h1>
        <p className="text-muted-foreground mt-2">
          Start your 30-day free trial. No charge until your trial ends.
        </p>
      </div>

      <Card className="border-2 border-primary shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="inline-flex items-baseline gap-1 justify-center">
            <span className="text-4xl font-extrabold">€35</span>
            <span className="text-muted-foreground text-lg">/month</span>
          </div>
          <CardTitle className="text-xl mt-2">Shelter Plan</CardTitle>
          <CardDescription>Everything you need to run your rescue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <ul className="space-y-3">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-green-800">30-day free trial included</p>
            <p className="text-xs text-green-600 mt-0.5">
              Enter your payment details now — you won&apos;t be charged for 30 days
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 text-center">
              {error}
            </p>
          )}

          <Button
            className="w-full text-base h-12"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Redirecting…" : "Start free trial"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <button
            onClick={() => router.push(`/${params.orgSlug}`)}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            Skip for now — explore the dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
