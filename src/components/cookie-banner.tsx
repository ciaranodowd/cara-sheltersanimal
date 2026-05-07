"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const STORAGE_KEY = "cara-cookie-consent"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted")
    setVisible(false)
    // Analytics gate: when you add GA or Plausible, initialise it here
    // e.g. window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined")
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-[#1a3a2a] text-white rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 pointer-events-auto">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm mb-1">We use cookies</p>
          <p className="text-xs text-white/70 leading-relaxed">
            Essential cookies keep the site working. With your consent we also use analytics
            cookies to understand how people find animals on Cara.{" "}
            <Link href="/privacy" className="underline hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-white/70 hover:text-white border border-white/20 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-[#4ade80] text-[#1a3a2a] rounded-lg hover:bg-[#22c55e] transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  )
}
