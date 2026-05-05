"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SPECIES_LABELS, COUNTIES } from "@/lib/constants"

const SPECIES_OPTIONS = ["DOG", "CAT", "RABBIT", "BIRD", "SMALL_ANIMAL", "FARM", "REPTILE", "OTHER"] as const

export function AdoptFilters({ total }: { total: number }) {
  const router = useRouter()
  const params = useSearchParams()
  const species = params.get("species") ?? ""
  const county = params.get("county") ?? ""

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      router.push(`/adopt?${next.toString()}`)
    },
    [params, router]
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        {total} {total === 1 ? "animal" : "animals"} looking for a home
      </p>
      <div className="flex flex-wrap gap-2">
        <select
          value={species}
          onChange={e => update("species", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-[#1a3a2a] font-medium focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
        >
          <option value="">All species</option>
          {SPECIES_OPTIONS.map(s => (
            <option key={s} value={s}>{SPECIES_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={county}
          onChange={e => update("county", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-[#1a3a2a] font-medium focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
        >
          <option value="">All locations</option>
          {COUNTIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {(species || county) && (
          <button
            onClick={() => router.push("/adopt")}
            className="text-sm text-gray-400 hover:text-[#1a3a2a] px-2 py-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}
