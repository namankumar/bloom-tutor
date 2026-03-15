import type { ReactNode } from 'react'
import { colors } from '../shared/tokens'

interface Props {
  children: ReactNode
}

export default function KitchenScene({ children }: Props) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: colors.cream,
      }}
    >
      <svg
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="wallTexture">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.05" />
            </feComponentTransfer>
          </filter>
          <linearGradient id="counterLight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D7B48B" />
            <stop offset="100%" stopColor="#C4A47C" />
          </linearGradient>
          <radialGradient id="ambientLight" cx="78%" cy="24%" r="55%">
            <stop offset="0%" stopColor="#FFF5D8" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#FFF5D8" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1440" height="1024" fill={colors.cream} />
        <rect width="1440" height="1024" fill="#ffffff" filter="url(#wallTexture)" opacity="0.22" />
        <rect x="0" y="0" width="1440" height="184" fill={colors.sageGreen} />
        <rect x="0" y="184" width="1440" height="454" fill="none" />
        <rect x="0" y="635" width="1440" height="389" fill="url(#counterLight)" />
        <rect x="0" y="635" width="1440" height="14" fill="#DDBA91" />
        <rect x="0" y="520" width="1440" height="115" fill="url(#ambientLight)" opacity="0.55" />

        {Array.from({ length: 34 }, (_, i) => (
          <line
            key={`tile-${i}`}
            x1={i * 44}
            y1="520"
            x2={i * 44}
            y2="635"
            stroke="#C6C0AF"
            strokeOpacity="0.6"
            strokeWidth="1.5"
          />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <line
            key={`tile-h-${i}`}
            x1="0"
            y1={520 + i * 29}
            x2="1440"
            y2={520 + i * 29}
            stroke="#C6C0AF"
            strokeOpacity="0.45"
            strokeWidth="1.5"
          />
        ))}

        <g transform="translate(1110 36)">
          <rect width="190" height="148" rx="18" fill="#E0B87A" stroke={colors.warmBrown} strokeWidth="6" />
          <rect x="14" y="14" width="162" height="120" rx="12" fill="#FFF0D7" />
          <line x1="95" y1="14" x2="95" y2="134" stroke={colors.warmBrown} strokeWidth="4" />
          <line x1="14" y1="74" x2="176" y2="74" stroke={colors.warmBrown} strokeWidth="4" />
          <ellipse cx="130" cy="46" rx="28" ry="14" fill="#ffffff" opacity="0.6" />
          <ellipse cx="60" cy="88" rx="36" ry="18" fill="#ffffff" opacity="0.38" />
        </g>

        <g transform="translate(118 72)">
          <ellipse cx="120" cy="40" rx="50" ry="8" fill="#5D7D63" opacity="0.35" />
          <rect x="84" y="8" width="72" height="40" rx="8" fill="#C58F62" stroke={colors.warmBrown} strokeWidth="4" />
          <ellipse cx="120" cy="0" rx="42" ry="14" fill="#D9A47C" stroke={colors.warmBrown} strokeWidth="4" />
          <path d="M110 0 C95 -25 95 -50 120 -68 C145 -50 145 -24 130 0 Z" fill="#79A66A" />
          <path d="M130 0 C118 -18 124 -44 150 -58 C167 -42 166 -20 148 2 Z" fill="#6B965A" />
        </g>

        <g transform="translate(360 94)">
          <rect x="0" y="22" width="46" height="58" rx="11" fill="#F7E2B0" stroke={colors.warmBrown} strokeWidth="4" />
          <rect x="11" y="0" width="24" height="24" rx="6" fill="#F2B84B" stroke={colors.warmBrown} strokeWidth="4" />
        </g>

        <g transform="translate(520 46)">
          <path d="M0 0 C20 26 20 58 20 90" stroke="#5B8A57" strokeWidth="5" strokeLinecap="round" />
          <path d="M12 18 C34 30 40 54 24 78" stroke="#7BAE7F" strokeWidth="5" strokeLinecap="round" />
          <path d="M10 42 C-14 54 -8 78 14 90" stroke="#5B8A57" strokeWidth="5" strokeLinecap="round" />
        </g>

        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`counter-${i}`}
            x1="0"
            y1={676 + i * 36}
            x2="1440"
            y2={692 + i * 36}
            stroke="#B58F67"
            strokeOpacity="0.28"
            strokeWidth="3"
          />
        ))}
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5vh 4vw 28vh',
        }}
      >
        {children}
      </div>
    </div>
  )
}
