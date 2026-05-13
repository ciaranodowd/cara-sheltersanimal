import { PawLoader } from "./paw-loader"

// Fixed strip at the bottom of the viewport shown during route-transition loading states.
// Rendered inside Next.js loading.tsx files (server components can import client components).
export function LoadingPaws() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: "24px",
        paddingBottom: "20px",
        paddingLeft: "32px",
        paddingRight: "32px",
        background: "linear-gradient(to bottom, transparent, rgba(248,250,252,0.92) 38%)",
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <PawLoader />
    </div>
  )
}
