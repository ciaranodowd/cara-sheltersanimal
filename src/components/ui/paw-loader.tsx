"use client"

// PawLoader — animated paw prints walking across the container.
//
// Speed — adjust stepDelay (seconds between each paw, smaller = faster trot)
// Size  — change the size prop (SVG width/height in px)
// Color — change the color prop (defaults to Cara brand green)

const BRAND_GREEN = "#4ade80"

function PawIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
    >
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="20" cy="16" r="2" />
      <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
    </svg>
  )
}

export function PawLoader({
  count = 8,
  size = 28,
  stepDelay = 0.13,
  color = BRAND_GREEN,
}: {
  count?: number
  size?: number
  stepDelay?: number
  color?: string
} = {}) {
  const duration = count * stepDelay

  return (
    <>
      <style>{`
        @keyframes paw-step {
          0%   { opacity: 0; transform: scale(0.4)  translateY(5px);  }
          12%  { opacity: 1; transform: scale(1)    translateY(0);    }
          55%  { opacity: 1; transform: scale(1)    translateY(0);    }
          72%  { opacity: 0; transform: scale(0.65) translateY(-3px); }
          100% { opacity: 0; transform: scale(0.4)  translateY(5px);  }
        }
      `}</style>
      <div
        role="status"
        aria-label="Loading"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          width: "100%",
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          // Outer div holds the alternating left/right tilt (static)
          // Inner div holds the pop-in/pop-out animation
          <div key={i} style={{ transform: `rotate(${i % 2 === 0 ? -12 : 12}deg)` }}>
            <div
              style={{
                animation: `paw-step ${duration}s linear -${i * stepDelay}s infinite`,
              }}
            >
              <PawIcon size={size} color={color} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
