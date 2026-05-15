"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, PawPrint, Users, Heart, MessageSquare } from "lucide-react"

interface MobileNavProps {
  orgSlug: string
  isAdmin?: boolean
}

export function MobileNav({ orgSlug, isAdmin: _isAdmin }: MobileNavProps) {
  const pathname = usePathname()

  const items = [
    { href: `/${orgSlug}`, label: "Home", icon: LayoutDashboard, exact: true },
    { href: `/${orgSlug}/animals`, label: "Animals", icon: PawPrint },
    { href: `/${orgSlug}/people`, label: "People", icon: Users },
    { href: `/${orgSlug}/adoptions`, label: "Adoptions", icon: Heart },
    { href: `/${orgSlug}/messages`, label: "Messages", icon: MessageSquare },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white z-40 pb-safe">
      <div className="flex">
        {items.map(item => {
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
      </div>
    </nav>
  )
}
