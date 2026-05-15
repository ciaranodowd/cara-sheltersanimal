"use client"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { Settings, LogOut, User } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/utils"

interface MobileHeaderProps {
  orgSlug: string
  orgName: string
}

export function MobileHeader({ orgSlug, orgName }: MobileHeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b" style={{ backgroundColor: "#1a3a2a" }}>
      <Link href={`/${orgSlug}`} className="flex items-center gap-2 min-w-0 active:opacity-70 transition-opacity">
        <div className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-sm shrink-0" style={{ backgroundColor: "#4ade80", color: "#1a3a2a" }}>
          C
        </div>
        <span className="text-white font-semibold text-sm truncate">{orgName}</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-10 w-10 flex items-center justify-center rounded-full active:opacity-70 transition-opacity" aria-label="Account menu">
            <Avatar className="h-8 w-8">
              {session?.user?.image && <AvatarImage src={session.user.image} />}
              <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: "#4ade80", color: "#1a3a2a" }}>
                {initials(session?.user?.name ?? session?.user?.email ?? "U")}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-2">
            <p className="text-sm font-medium truncate">{session?.user?.name ?? "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/settings/profile`} className="flex items-center gap-2 min-h-[44px]">
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/${orgSlug}/settings`} className="flex items-center gap-2 min-h-[44px]">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive flex items-center gap-2 min-h-[44px]"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
