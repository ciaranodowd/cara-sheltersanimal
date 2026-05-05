import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Globe,
  ClipboardList,
  FilePen,
  Share2,
  Mail,
  PawPrint,
  Clock,
  TrendingUp,
  FileCheck,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

export const dynamic = "force-dynamic"

// ── MARKETING IMAGE CONFIG ─────────────────────────────────────────────────
// 1. Upload images to Supabase Storage → bucket: marketinganimals
// 2. Set each value below to the exact filename as it appears in the bucket
//    (including file extension). Set to "" to show a neutral placeholder.
const MARKETING_BUCKET = "marketinganimals"
const MARKETING_IMAGES: Record<string, string> = {
  hero:    "Screenshot 2026-05-04 203014.png",
  buddy:   "Screenshot 2026-05-04 203014.png",
  rex:     "Screenshot 2026-05-04 203035.png",
  mittens: "Screenshot 2026-05-04 203105.png",
  luna:    "Screenshot 2026-05-04 203116.png",
  charlie: "Screenshot 2026-05-04 203035.png",
  bella:   "Screenshot 2026-05-04 203130.png",
}

function marketingImageUrl(key: string): string {
  const filename = MARKETING_IMAGES[key] ?? ""
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!filename || !base) return ""
  const encoded = filename.split("/").map(encodeURIComponent).join("/")
  return `${base}/storage/v1/object/public/${MARKETING_BUCKET}/${encoded}`
}

const ANIMALS = [
  { name: "Buddy",   type: "Dog", status: "Available", imageKey: "buddy"   },
  { name: "Mittens", type: "Cat", status: "Applied",   imageKey: "mittens" },
  { name: "Rex",     type: "Dog", status: "Available", imageKey: "rex"     },
  { name: "Luna",    type: "Cat", status: "Adopted",   imageKey: "luna"    },
  { name: "Charlie", type: "Dog", status: "Available", imageKey: "charlie" },
  { name: "Bella",   type: "Cat", status: "Applied",   imageKey: "bella"   },
]

const ANIMAL_STRIP = [
  { key: "buddy",   alt: "Tan dog with blue collar available for adoption", name: "Buddy",   label: "Dog · Available" },
  { key: "rex",     alt: "Happy black and tan dog sitting on a bench",      name: "Rex",     label: "Dog · Available" },
  { key: "mittens", alt: "Tabby cat with green eyes looking for a home",   name: "Mittens", label: "Cat · Applied"   },
  { key: "luna",    alt: "Tabby cat in a shelter waiting for adoption",     name: "Luna",    label: "Cat · Adopted"   },
  { key: "bella",   alt: "Black and white cat with striking eyes",          name: "Bella",   label: "Cat · Applied"   },
]

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isAuthenticated = !!session?.user?.id

  let dashboardUrl = "/onboarding"
  if (isAuthenticated) {
    const membership = await prisma.userOrganization.findFirst({
      where: { userId: session!.user!.id },
      include: { organization: { select: { slug: true } } },
      orderBy: { joinedAt: "asc" },
    })
    if (membership) {
      dashboardUrl = `/${(membership as any).organization.slug}`
    }
    redirect(dashboardUrl)
  }

  return (
    <div className="min-h-screen">
      {/* ── ADOPTER BANNER ── */}
      <Link
        href="/adopt"
        className="flex items-center justify-center gap-2 bg-[#edf7f0] border-b border-[#c6e8d3] py-3 px-4 hover:bg-[#d4efdf] transition-colors group"
      >
        <span className="text-lg leading-none">🐾</span>
        <span className="text-sm sm:text-base text-[#1a3a2a]">
          Looking to adopt a pet?{" "}
          <span className="font-semibold underline underline-offset-2">Browse animals available near you</span>
        </span>
        <ArrowRight className="w-4 h-4 text-[#1a3a2a] shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* ── NAVBAR ── */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#1a3a2a] flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-[#4ade80]" />
            </div>
            <span className="text-xl font-bold text-[#1a3a2a]">Cara</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-[#1a3a2a] transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-[#1a3a2a] transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-sm text-gray-600 hover:text-[#1a3a2a] transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href={dashboardUrl}
                className="px-4 py-2 text-sm font-semibold bg-[#1a3a2a] text-white rounded-lg hover:bg-[#2d5a3d] transition-colors"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-[#1a3a2a] pt-20 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Two-column layout: text left, hero image right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: text content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#2d5a3d] text-[#4ade80] text-sm font-medium px-4 py-2 rounded-full mb-8">
                <PawPrint className="w-4 h-4" />
                <span>Built for Irish &amp; European shelters</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                The modern home for
                <br />
                animal shelters
              </h1>

              <p className="text-lg text-[#a7c4b5] max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Replace Facebook DMs and spreadsheets with a purpose-built platform. Manage animals,
                applications, and adoptions — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-14">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#4ade80] text-[#1a3a2a] font-semibold rounded-lg hover:bg-[#22c55e] transition-colors text-base"
                >
                  Start free trial
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-3.5 border border-[#4a7a5a] text-white font-medium rounded-lg hover:bg-[#2d5a3d] transition-colors text-base flex items-center justify-center gap-2"
                >
                  See a live demo <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10">
                {[
                  { value: "8 hrs", label: "saved per week" },
                  { value: "€35", label: "per month" },
                  { value: "10 min", label: "to get started" },
                  { value: "Free", label: "to try" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-bold text-[#4ade80]">{stat.value}</span>
                    <span className="text-sm text-[#a7c4b5] mt-0.5">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: hero dog photo */}
            <div className="flex justify-center lg:justify-end pb-8 lg:pb-0">
              <div className="relative w-72 sm:w-96 lg:w-full lg:max-w-md">
                {marketingImageUrl("hero") ? (
                  <div className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-2xl border-4 border-[#2d5a3d]">
                    <Image
                      src={marketingImageUrl("hero") as string}
                      alt="Rescue dog available for adoption"
                      fill
                      className="object-cover object-[center_20%]"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-2xl shadow-2xl border-4 border-[#2d5a3d] bg-[#2d5a3d]" />
                )}
                <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-sm font-semibold text-[#1a3a2a]">Available for adoption</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto max-w-5xl mt-16">
            <div className="bg-[#0f2318] rounded-t-2xl border border-[#2d5a3d] border-b-0 overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-[#162e1f] px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="flex-1 flex justify-center">
                  <div className="bg-[#0f2318] rounded px-10 py-1 text-xs text-[#4a7a5a]">
                    cara.ie/dublin-spca
                  </div>
                </div>
              </div>

              {/* App shell */}
              <div className="flex" style={{ height: "340px" }}>
                {/* Sidebar */}
                <div className="w-44 bg-[#1a3a2a] flex-shrink-0 p-4 hidden sm:flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full bg-[#4ade80] flex items-center justify-center">
                      <PawPrint className="w-3.5 h-3.5 text-[#1a3a2a]" />
                    </div>
                    <span className="text-white text-sm font-semibold">Cara</span>
                  </div>
                  {[
                    { label: "Dashboard", active: false },
                    { label: "Animals", active: true },
                    { label: "Applications", active: false },
                    { label: "Adoptions", active: false },
                    { label: "Settings", active: false },
                  ].map(({ label, active }) => (
                    <div
                      key={label}
                      className={`px-3 py-2 rounded-lg mb-1 text-xs ${
                        active ? "bg-[#4ade80]/20 text-[#4ade80] font-medium" : "text-[#a7c4b5]"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 bg-gray-50 p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-800">Animals (12)</span>
                    <div className="text-xs bg-[#1a3a2a] text-white px-3 py-1 rounded-lg">+ Add animal</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ANIMALS.map((animal) => {
                      const imgUrl = marketingImageUrl(animal.imageKey)
                      return (
                        <div key={animal.name} className="bg-white rounded-lg p-2.5 border border-gray-100 shadow-sm">
                          <div className="relative rounded-md h-16 mb-2 overflow-hidden bg-gray-100">
                            {imgUrl && (
                              <Image
                                src={imgUrl}
                                alt={`${animal.name} the ${animal.type.toLowerCase()}`}
                                fill
                                className="object-cover object-[center_20%]"
                              />
                            )}
                          </div>
                          <div className="text-xs font-semibold text-gray-800">{animal.name}</div>
                          <div
                            className={`text-xs mt-0.5 ${
                              animal.status === "Available"
                                ? "text-green-600"
                                : animal.status === "Applied"
                                ? "text-amber-600"
                                : "text-blue-600"
                            }`}
                          >
                            {animal.status}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <section className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <span className="text-sm font-medium text-gray-400 whitespace-nowrap flex-shrink-0">
              Trusted by shelters across Ireland
            </span>
            <div className="hidden sm:block w-px h-5 bg-gray-200" />
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-8 gap-y-2">
              {[
                "Dublin SPCA",
                "Cork Dog Action Welfare Group",
                "Galway SPCA",
                "Limerick Animal Welfare",
                "Wexford Animal Shelter",
                "Kerry Animal Foundation",
              ].map((name) => (
                <span key={name} className="text-sm text-gray-400 font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-4">
              Everything your shelter needs
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              One platform to manage your animals, applications, and community — built from the ground up
              for Irish and European shelters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Public adoption portal",
                desc: "A beautiful, branded page for your shelter. Adopters can browse animals and submit applications online — no account required.",
              },
              {
                icon: ClipboardList,
                title: "Application management",
                desc: "Track every adoption enquiry in one place. Move applications through stages, add notes, and approve or decline with one click.",
              },
              {
                icon: FilePen,
                title: "E-sign contracts",
                desc: "Send adoption contracts digitally and collect legally binding signatures — no printing, scanning, or chasing paper.",
              },
              {
                icon: Share2,
                title: "Social sharing",
                desc: "Generate shareable links for individual animals. Boost visibility on Facebook, Instagram, and WhatsApp in seconds.",
              },
              {
                icon: Mail,
                title: "Email notifications",
                desc: "Automated emails keep applicants informed at every stage — from acknowledgement to outcome — without the manual follow-up.",
              },
              {
                icon: PawPrint,
                title: "Animal management",
                desc: "Full records for every animal: photos, history, medical notes, current status, and foster details — all in one place.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#1a3a2a]/30 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 bg-[#1a3a2a]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#1a3a2a]/20 transition-colors">
                  <Icon className="w-5 h-5 text-[#1a3a2a]" />
                </div>
                <h3 className="font-semibold text-[#1a3a2a] mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIME SAVINGS ── */}
      <section className="bg-[#1a3a2a] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-snug">
                Your volunteers deserve better than spreadsheets
              </h2>
              <p className="text-[#a7c4b5] text-lg mb-8 leading-relaxed">
                Shelter teams spend hours every week managing enquiries over Facebook Messenger, chasing
                contracts by email, and manually updating spreadsheets. Cara gives that time back.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4ade80] text-[#1a3a2a] font-semibold rounded-lg hover:bg-[#22c55e] transition-colors"
              >
                Start your free trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Clock,
                  value: "8 hrs",
                  label: "saved per week",
                  desc: "Stop manually tracking applications and chasing responses over DMs.",
                },
                {
                  icon: TrendingUp,
                  value: "3×",
                  label: "more enquiries",
                  desc: "A public portal makes applying easy — more people apply when it's online.",
                },
                {
                  icon: FileCheck,
                  value: "Zero",
                  label: "paper contracts",
                  desc: "E-sign adoption contracts — legally binding, no printer required.",
                },
              ].map(({ icon: Icon, value, label, desc }) => (
                <div key={label} className="bg-[#2d5a3d] rounded-xl p-5 flex items-start gap-5">
                  <div className="w-11 h-11 bg-[#4ade80]/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#4ade80]" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{value}</span>
                      <span className="text-[#4ade80] text-sm font-semibold">{label}</span>
                    </div>
                    <p className="text-sm text-[#a7c4b5] mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ADOPTABLE ANIMALS STRIP ── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3a2a] mb-3">
              Meet some of the animals finding homes
            </h2>
            <p className="text-gray-500 text-sm">
              Real animals, real shelters — managed entirely through Cara.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {ANIMAL_STRIP.map((animal) => {
              const imgUrl = marketingImageUrl(animal.key)
              return (
                <div key={animal.name} className="group">
                  <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-3 shadow-sm border border-gray-100">
                    {imgUrl && (
                      <Image
                        src={imgUrl}
                        alt={animal.alt}
                        fill
                        className="object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#1a3a2a] text-center">{animal.name}</p>
                  <p className="text-xs text-gray-400 text-center mt-0.5">{animal.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600">No setup fees. No hidden costs. Cancel any time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div>
                <h3 className="font-bold text-lg text-[#1a3a2a] mb-1">Starter</h3>
                <p className="text-gray-500 text-sm mb-6">For small shelters just getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1a3a2a]">Free</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Up to 10 animals",
                    "Public adoption portal",
                    "Online applications",
                    "Photo uploads",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#1a3a2a] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <Link
                  href="/register"
                  className="block w-full text-center py-2.5 border border-[#1a3a2a] text-[#1a3a2a] rounded-lg font-medium hover:bg-[#1a3a2a] hover:text-white transition-colors text-sm"
                >
                  Get started free
                </Link>
              </div>
            </div>

            {/* Pro — featured */}
            <div className="bg-[#1a3a2a] rounded-2xl p-8 relative shadow-2xl flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#4ade80] text-[#1a3a2a] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most popular
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Pro</h3>
                <p className="text-[#a7c4b5] text-sm mb-6">For active shelters ready to scale</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">€35</span>
                  <span className="text-[#a7c4b5] text-sm ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited animals",
                    "E-sign contracts",
                    "Email notifications",
                    "Social sharing",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                      <CheckCircle className="w-4 h-4 text-[#4ade80] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <Link
                  href="/register"
                  className="block w-full text-center py-2.5 bg-[#4ade80] text-[#1a3a2a] rounded-lg font-semibold hover:bg-[#22c55e] transition-colors text-sm"
                >
                  Start free trial
                </Link>
              </div>
            </div>

            {/* Network */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div>
                <h3 className="font-bold text-lg text-[#1a3a2a] mb-1">Network</h3>
                <p className="text-gray-500 text-sm mb-6">For organisations with multiple locations</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#1a3a2a]">€99</span>
                  <span className="text-gray-500 text-sm ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Multiple locations",
                    "Custom domain",
                    "Staff accounts",
                    "Analytics dashboard",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-[#1a3a2a] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <Link
                  href="/register"
                  className="block w-full text-center py-2.5 border border-[#1a3a2a] text-[#1a3a2a] rounded-lg font-medium hover:bg-[#1a3a2a] hover:text-white transition-colors text-sm"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="about" className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1a3a2a] mb-4">
            Ready to modernise your shelter?
          </h2>
          <p className="text-gray-600 mb-10 text-lg">
            Join shelters across Ireland using Cara to find forever homes faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                href={dashboardUrl}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1a3a2a] text-white font-semibold rounded-lg hover:bg-[#2d5a3d] transition-colors"
              >
                Go to your dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#1a3a2a] text-white font-semibold rounded-lg hover:bg-[#2d5a3d] transition-colors"
                >
                  Register your shelter
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-8 py-3.5 border border-[#1a3a2a] text-[#1a3a2a] font-medium rounded-lg hover:bg-[#1a3a2a] hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  See a demo <ArrowRight className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a3a2a] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-[#4ade80]" />
              </div>
              <span className="text-white font-semibold">Cara</span>
            </Link>
            <p className="text-[#a7c4b5] text-sm text-center order-last sm:order-none">
              © {new Date().getFullYear()} Cara. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Privacy", "Terms", "Contact"].map((link) => (
                <a key={link} href="#" className="text-[#a7c4b5] text-sm hover:text-white transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
