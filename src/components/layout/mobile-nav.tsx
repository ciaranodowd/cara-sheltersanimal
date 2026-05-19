"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, PawPrint, Users, Heart,
  MessageSquare, DollarSign, BarChart3, Globe,
  CreditCard, Settings, Menu, X, ExternalLink,
} from "lucide-react"

interface MobileNavProps {
  orgSlug: string
  plan?: string
  isAdmin?: boolean
}

export function MobileNav({ orgSlug, plan }: MobileNavProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const mainItems = [
    { href: `/${orgSlug}`,           label: "Home",      icon: LayoutDashboard, exact: true },
    { href: `/${orgSlug}/animals`,   label: "Animals",   icon: PawPrint },
    { href: `/${orgSlug}/people`,    label: "People",    icon: Users },
    { href: `/${orgSlug}/adoptions`, label: "Adoptions", icon: Heart },
  ]

  const moreItems = [
    { href: `/${orgSlug}/messages`,  label: "Messages",      icon: MessageSquare },
    { href: `/${orgSlug}/donations`, label: "Donations",     icon: DollarSign },
    { href: `/${orgSlug}/reports`,   label: "Reports",       icon: BarChart3 },
    { href: `/portal/${orgSlug}`,    label: "Public Portal", icon: Globe, external: true },
    { href: `/${orgSlug}/billing`,   label: "Billing",       icon: CreditCard, badge: plan === "pro" ? "Pro" : "Trial" },
    { href: `/${orgSlug}/settings`,  label: "Settings",      icon: Settings },
  ]

  const moreActive = moreItems.some(
    item => !item.external && (pathname === item.href || pathname.startsWith(item.href + "/"))
  )

  function close() { setSheetOpen(false) }

  return (
    <>
      {/* ── Bottom nav bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-40 pb-safe">
        <div className="flex">
          {mainItems.map(item => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 min-h-[56px]",
                  "text-[10px] font-medium transition-colors active:opacity-60",
                  active ? "text-primary" : "text-slate-400"
                )}
              >
                <item.icon className={cn("h-[22px] w-[22px]", active && "stroke-[2.5px]")} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1 min-h-[56px]",
              "text-[10px] font-medium transition-colors active:opacity-60",
              (sheetOpen || moreActive) ? "text-primary" : "text-slate-400"
            )}
          >
            <Menu className={cn("h-[22px] w-[22px]", (sheetOpen || moreActive) && "stroke-[2.5px]")} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        className={cn(
          "md:hidden fixed inset-0 z-[48] transition-opacity duration-300",
          sheetOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={close}
      />

      {/* ── Slide-up sheet ── */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-[49]",
          "transition-transform duration-300 ease-out",
          sheetOpen ? "translate-y-0" : "translate-y-full"
        )}
        aria-modal="true"
        role="dialog"
      >
        <div className="bg-white rounded-t-2xl shadow-2xl">
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
            style={{ backgroundColor: "#1a3a2a" }}
          >
            <span className="font-semibold text-sm text-white tracking-wide">More</span>
            <button
              onClick={close}
              aria-label="Close menu"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15 text-white transition-colors active:bg-white/30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Grid */}
          <div className="p-3 grid grid-cols-3 gap-2.5">
            {moreItems.map(item => {
              const active = !item.external && (
                pathname === item.href || pathname.startsWith(item.href + "/")
              )
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={close}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl text-center",
                    "transition-colors active:opacity-70",
                    active ? "text-white" : "text-[#1a3a2a]"
                  )}
                  style={{ backgroundColor: active ? "#1a3a2a" : "#eef5f1" }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="text-[11px] font-semibold leading-tight">{item.label}</span>

                  {/* External link indicator */}
                  {item.external && (
                    <ExternalLink className="absolute top-2.5 right-2.5 h-3 w-3 opacity-40" />
                  )}

                  {/* Plan badge */}
                  {item.badge && (
                    <span
                      className={cn(
                        "absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none",
                        item.badge === "Pro"
                          ? "bg-[#4ade80] text-[#1a3a2a]"
                          : active
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-500"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Safe-area spacer for notched phones */}
          <div className="pb-safe" />
        </div>
      </div>
    </>
  )
}
