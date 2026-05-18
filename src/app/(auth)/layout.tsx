export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2.5 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Cara logo" width={36} height={36} />
            <span className="text-2xl font-bold text-primary">Cara</span>
          </div>
          <p className="text-sm text-muted-foreground">Helping rescues find forever homes</p>
        </div>
        {children}
      </div>
    </div>
  )
}
