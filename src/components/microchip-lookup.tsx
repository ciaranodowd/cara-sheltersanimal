"use client"
import { useState } from "react"
import { Copy, Check, ExternalLink, ScanLine } from "lucide-react"
import { Button } from "@/components/ui/button"

const REGISTRIES = [
  { name: "Fido", url: "https://www.fido.ie/chipcheck" },
  { name: "Animark", url: "https://animark.ie/chip-search" },
  { name: "MicroDogID", url: "https://microdogid.ie/DogIdentificationEnquiry/" },
  { name: "EuroPetNet", url: "https://www.europetnet.com" },
]

/** Used on the animal detail page — shows chip number with copy icon + registry lookup panel */
export function MicrochipDisplay({ chipNumber }: { chipNumber: string | null | undefined }) {
  const [copied, setCopied] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  if (!chipNumber) return <span className="font-medium">—</span>

  async function copyChip() {
    await navigator.clipboard.writeText(chipNumber!).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleCheckRegistration() {
    await navigator.clipboard.writeText(chipNumber!).catch(() => {})
    setCopied(true)
    setPanelOpen(v => !v)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="font-mono font-semibold text-sm tracking-wide">{chipNumber}</span>
        <button
          onClick={copyChip}
          className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
          title="Copy chip number"
          type="button"
        >
          {copied && !panelOpen
            ? <Check className="h-3.5 w-3.5 text-emerald-600" />
            : <Copy className="h-3.5 w-3.5" />
          }
        </button>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        onClick={handleCheckRegistration}
      >
        <ScanLine className="h-3 w-3" />
        Check registration
      </Button>
      {panelOpen && (
        <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5 shrink-0" />
            Chip number copied — paste into a registry below
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {REGISTRIES.map(r => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1 text-xs px-2.5 py-1.5 rounded-md bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-800 font-medium transition-colors"
              >
                <span>{r.name}</span>
                <ExternalLink className="h-3 w-3 shrink-0 text-emerald-400" />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="text-xs text-emerald-500 hover:text-emerald-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

/** Used in the animal edit form — button + panel only, reads the live input value */
export function MicrochipRegistryButton({ chipNumber }: { chipNumber: string }) {
  const [copied, setCopied] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  if (!chipNumber.trim()) return null

  async function handleCheck() {
    await navigator.clipboard.writeText(chipNumber).catch(() => {})
    setCopied(true)
    setPanelOpen(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5 w-full border-primary/30 text-primary hover:bg-primary/5"
        onClick={handleCheck}
      >
        <ScanLine className="h-3 w-3" />
        Check registration
      </Button>
      {panelOpen && (
        <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            {copied
              ? <><Check className="h-3.5 w-3.5 shrink-0" /> Chip number copied to clipboard</>
              : <><ScanLine className="h-3.5 w-3.5 shrink-0" /> Check chip registration:</>
            }
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {REGISTRIES.map(r => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-1 text-xs px-2.5 py-1.5 rounded-md bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-800 font-medium transition-colors"
              >
                <span>{r.name}</span>
                <ExternalLink className="h-3 w-3 shrink-0 text-emerald-400" />
              </a>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="text-xs text-emerald-500 hover:text-emerald-700 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
