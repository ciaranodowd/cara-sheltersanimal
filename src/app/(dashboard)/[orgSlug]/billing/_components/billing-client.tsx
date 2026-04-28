"use client"
import { useState } from "react"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Props {
  orgSlug: string
  plan: string
  planStatus: string
  trialEndDate: string | null
  isAdmin: boolean
}

const FEATURES = [
  "Unlimited animals & intake records",
  "Full adoption workflow & e-sign contracts",
  "Public adoption portal for your shelter",
  "Team access with role-based permissions",
  "Email templates & donor tracking",
  "GDPR tools & reporting",
]

export function BillingClient({ plan, trialEndDate, isAdmin }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const trialDate = trialEndDate ? new Date(trialEndDate) : null
  const trialDaysLeft = trialDate
    ? Math.max(0, Math.ceil((trialDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const isExpired = plan === "trial" && trialDaysLeft === 0
  const isPro = plan === "pro"
  const isActiveTrial = plan === "trial" && trialDaysLeft > 0

  return (
    <div className="space-y-4">
      {/* Status card */}
      <Card
        className={
          isPro
            ? "border-green-200 bg-green-50"
            : isExpired
              ? "border-red-200 bg-red-50"
              : "border-blue-200 bg-blue-50"
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {isPro ? (
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            ) : isExpired ? (
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            ) : (
              <Clock className="h-5 w-5 text-blue-500 shrink-0" />
            )}

            <Badge
              className={
                isPro
                  ? "bg-green-600 text-white hover:bg-green-600"
                  : isExpired
                    ? "bg-red-500 text-white hover:bg-red-500"
                    : "bg-blue-500 text-white hover:bg-blue-500"
              }
            >
              {isPro ? "Cara Pro ✓" : isExpired ? "Trial Expired" : "Free Trial"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isPro && (
            <>
              <p className="font-semibold text-green-800">You&apos;re on Cara Pro — €30/month</p>
              <p className="text-sm text-green-700">Thank you for supporting Cara.</p>
            </>
          )}

          {isActiveTrial && (
            <>
              <p className="text-sm font-medium text-blue-800">
                You have {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left on your free trial
              </p>
              {isAdmin && (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-[#1a3a2a] hover:bg-[#1a3a2a]/90 text-white"
                >
                  Upgrade to Cara Pro — €30/month
                </Button>
              )}
            </>
          )}

          {isExpired && (
            <>
              <p className="text-sm font-medium text-red-800">Your free trial has ended</p>
              <p className="text-sm text-red-700">
                Some features may be restricted until you upgrade to Cara Pro.
              </p>
              {isAdmin && (
                <Button
                  onClick={() => setModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Upgrade to Cara Pro — €30/month
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Features list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">What&apos;s included in Cara Pro</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            {FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Interest modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Thanks for your interest in Cara Pro!</DialogTitle>
            <DialogDescription className="pt-1">
              We&apos;ll be in touch shortly to get you set up.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-2">
            <Button className="w-full" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
