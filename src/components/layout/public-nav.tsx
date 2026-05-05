import Link from "next/link"
import { PawPrint } from "lucide-react"

interface NavLink {
  label: string
  href: string
}

interface PublicNavProps {
  navLinks?: NavLink[]
}

export function PublicNav({ navLinks }: PublicNavProps) {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#1a3a2a] flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-[#4ade80]" />
          </div>
          <span className="text-xl font-bold text-[#1a3a2a]">Cara</span>
        </Link>

        {navLinks && navLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-[#1a3a2a] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-[#1a3a2a] border border-[#1a3a2a] rounded-lg hover:bg-[#1a3a2a] hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold bg-[#1a3a2a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors"
          >
            <span className="hidden sm:inline">Register your shelter</span>
            <span className="sm:hidden">Register</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
