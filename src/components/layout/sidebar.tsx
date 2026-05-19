"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/utils"
import {
  LayoutDashboard, PawPrint, Users, Heart,
  DollarSign, BarChart3, Settings, LogOut,
  ChevronDown, Globe, CreditCard, MessageSquare, ExternalLink
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SidebarProps {
  orgSlug: string
  orgName: string
  plan?: string
}

function nav(slug: string, plan?: string) {
  const planBadge = plan === "pro" ? "Pro" : "Trial"
  return [
    { href: `/${slug}`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/${slug}/animals`, label: "Animals", icon: PawPrint },
    { href: `/${slug}/people`, label: "People", icon: Users },
    { href: `/${slug}/adoptions`, label: "Adoptions", icon: Heart },
    { href: `/${slug}/messages`, label: "Messages", icon: MessageSquare },
    { href: `/${slug}/donations`, label: "Donations", icon: DollarSign },
    { href: `/${slug}/reports`, label: "Reports", icon: BarChart3 },
    { href: `/portal/${slug}`, label: "Public Portal", icon: Globe, external: true },
    { href: `/${slug}/billing`, label: "Billing", icon: CreditCard, badge: planBadge },
    { href: `/${slug}/settings`, label: "Settings", icon: Settings },
  ]
}

export function Sidebar({ orgSlug, orgName, plan }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const navItems = nav(orgSlug, plan)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch(`/api/orgs/${orgSlug}/applications/unread-count`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setUnreadCount(data?.count ?? 0))
      .catch(() => {})
  }, [orgSlug, pathname])

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0" style={{ backgroundColor: "#1a3a2a" }}>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href={`/${orgSlug}`} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#4ade80" }}>
              <PawPrint className="w-4 h-4" style={{ color: "#1a3a2a" }} />
            </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-base leading-tight">Cara</p>
            <p className="text-xs text-white/50 truncate">{orgName}</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = !item.external && (item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/"))
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "text-[#1a3a2a] bg-[#4ade80]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.external && <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />}
              {item.label === "Adoptions" && unreadCount > 0 && (
                <span className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center tabular-nums shrink-0",
                  active ? "bg-[#1a3a2a]/25 text-[#1a3a2a]" : "bg-[#4ade80] text-[#1a3a2a]"
                )}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {item.badge && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded font-semibold leading-none",
                    item.badge === "Pro"
                      ? "bg-[#4ade80] text-[#1a3a2a]"
                      : active
                        ? "bg-[#1a3a2a]/20 text-[#1a3a2a]"
                        : "bg-white/15 text-white/80"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
              <Avatar className="h-8 w-8 shrink-0">
                {session?.user?.image && <AvatarImage src={session.user.image} />}
                <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: "#4ade80", color: "#1a3a2a" }}>
                  {initials(session?.user?.name ?? session?.user?.email ?? "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name ?? "User"}</p>
                <p className="text-xs text-white/50 truncate">{session?.user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${orgSlug}/settings/profile`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
