import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { colors, fonts } from '../shared/tokens'
import { DOT_POSITIONS } from '../shared/session'
import type { StagePuzzle } from '../shared/types'

function Fruit({ kind }: { kind: 'tomato' | 'strawberry' }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: kind === 'tomato' ? '#D4704A' : '#D95C79',
        border: `3px solid ${colors.warmBrown}`,
        position: 'relative',
        boxShadow: '0 4px 10px rgba(139,94,60,0.12)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 7,
          width: 10,
          height: 8,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.55)',
        }}
      />
    </div>
  )
}

function Bowl({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div
      style={{
        width: 'min(42vw, 300px)',
        minHeight: 170,
        borderRadius: '0 0 140px 140px',
        border: `4px solid ${colors.warmBrown}`,
        background: 'linear-gradient(180deg, #FFF7EA 0%, #F3E5CF 100%)',
        boxShadow: '0 10px 24px rgba(139,94,60,0.12)',
        padding: '30px 24px 28px',
        position: 'relative',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        alignContent: 'flex-start',
      }}
    >
      {label ? (
        <div
          style={{
            position: 'absolute',
            top: -34,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: fonts.body,
            fontWeight: 800,
            fontSize: 16,
            color: colors.warmBrown,
            background: 'rgba(255,250,242,0.95)',
            border: `2px solid ${colors.softShadow}`,
            borderRadius: 999,
            padding: '6px 12px',
          }}
        >
          {label}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function TinyDots({ count }: { count: number }) {
  const positions = DOT_POSITIONS[Math.min(Math.max(count, 1), 5)] ?? []
  return (
    <div
      style={{
        width: 52,
        height: 40,
        borderRadius: 14,
        background: 'rgba(255,255,255,0.82)',
        position: 'relative',
        border: '2px solid rgba(139,94,60,0.1)',
      }}
    >
      {positions.map(([x, y], index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: colors.terracotta,
          }}
        />
      ))}
    </div>
  )
}

function TenFrame({ filled }: { filled: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 48px)',
        gap: 8,
        padding: 14,
        background: 'rgba(255,250,242,0.94)',
        borderRadius: 24,
        border: `3px solid ${colors.softShadow}`,
      }}
    >
      {Array.from({ length: 10 }, (_, index) => {
        const isFilled = index < filled
        return (
          <div
            key={index}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: isFilled ? colors.goldenYellow : '#F5EFE2',
              border: `2px solid ${isFilled ? colors.warmBrown : 'rgba(139,94,60,0.14)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isFilled ? <Fruit kind="tomato" /> : null}
          </div>
        )
      })}
    </div>
  )
}

function NumberBondBoard({ whole, part }: { whole: number; part: number }) {
  const missing = whole - part
  return (
    <div style={{ position: 'relative', width: 'min(58vw, 420px)', height: 260 }}>
      <svg viewBox="0 0 420 260" width="100%" height="100%">
        <line x1="210" y1="76" x2="120" y2="160" stroke={colors.softShadow} strokeWidth="6" />
        <line x1="210" y1="76" x2="300" y2="160" stroke={colors.softShadow} strokeWidth="6" />
        <circle cx="210" cy="64" r="54" fill="#FFF8EE" stroke={colors.warmBrown} strokeWidth="4" />
        <circle cx="120" cy="176" r="56" fill="#FFF3DD" stroke={colors.warmBrown} strokeWidth="4" />
        <circle cx="300" cy="176" r="56" fill="#FFF8EE" stroke={colors.warmBrown} strokeWidth="4" strokeDasharray="10 8" />
        <text x="210" y="73" textAnchor="middle" fontFamily={fonts.number} fontSize="40" fill={colors.darkWarmBrown}>
          {whole}
        </text>
        <text x="120" y="185" textAnchor="middle" fontFamily={fonts.number} fontSize="40" fill={colors.darkWarmBrown}>
          {part}
        </text>
        <text x="300" y="185" textAnchor="middle" fontFamily={fonts.body} fontSize="18" fontWeight="800" fill={colors.warmBrown}>
          ?
        </text>
      </svg>
      <div style={{ position: 'absolute', right: 18, bottom: 16 }}>
        <TinyDots count={Math.min(Math.max(missing, 1), 5)} />
      </div>
    </div>
  )
}

function PlaceValueBoard({ tens, ones }: { tens: number; ones: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(120px, 180px))',
        gap: 18,
      }}
    >
      <Bowl label="Tens">
        {Array.from({ length: tens }, (_, index) => (
          <div
            key={index}
            style={{
              width: 60,
              height: 82,
              borderRadius: 16,
              background: colors.softBlue,
              border: `3px solid ${colors.warmBrown}`,
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 4,
              padding: 8,
            }}
          >
            {Array.from({ length: 10 }, (_, egg) => (
              <div key={egg} style={{ width: 14, height: 14, borderRadius: '50%', background: '#FFF7EA' }} />
            ))}
          </div>
        ))}
      </Bowl>
      <Bowl label="Ones">
        {Array.from({ length: ones }, (_, index) => (
          <Fruit key={index} kind="tomato" />
        ))}
      </Bowl>
    </div>
  )
}

function GroupsBoard({ groups, each, itemKind }: { groups: number; each: number; itemKind: 'tomato' | 'strawberry' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: groups > 2 ? 'repeat(2, minmax(140px, 200px))' : `repeat(${groups}, minmax(140px, 200px))`,
        gap: 18,
        justifyContent: 'center',
      }}
    >
      {Array.from({ length: groups }, (_, groupIndex) => (
        <Bowl key={groupIndex} label={`Group ${groupIndex + 1}`}>
          {Array.from({ length: each }, (_, index) => (
            <Fruit key={index} kind={itemKind} />
          ))}
        </Bowl>
      ))}
    </div>
  )
}

export default function StageBoard({ puzzle }: { puzzle: StagePuzzle }) {
  switch (puzzle.kind) {
    case 'subitizing':
      return null
    case 'counting':
      return (
        <Bowl label="Counting Bowl">
          {Array.from({ length: puzzle.target }, (_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Fruit kind={puzzle.item} />
            </motion.div>
          ))}
        </Bowl>
      )
    case 'tenframe':
      return <TenFrame filled={puzzle.filled} />
    case 'numberBond':
      return <NumberBondBoard whole={puzzle.whole} part={puzzle.part} />
    case 'addition':
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(140px, 220px) 54px minmax(140px, 220px)',
            gap: 16,
            alignItems: 'center',
          }}
        >
          <Bowl label="Bowl 1">
            {Array.from({ length: puzzle.left }, (_, index) => (
              <Fruit key={index} kind="tomato" />
            ))}
          </Bowl>
          <div style={{ fontFamily: fonts.number, fontSize: 42, color: colors.warmBrown, textAlign: 'center' }}>+</div>
          <Bowl label="Bowl 2">
            {Array.from({ length: puzzle.right }, (_, index) => (
              <Fruit key={index} kind="strawberry" />
            ))}
          </Bowl>
        </div>
      )
    case 'placeValue':
      return <PlaceValueBoard tens={puzzle.tens} ones={puzzle.ones} />
    case 'skipCounting':
      return <GroupsBoard groups={puzzle.groups} each={puzzle.step} itemKind="tomato" />
    case 'multiplication':
      return <GroupsBoard groups={puzzle.groups} each={puzzle.each} itemKind="strawberry" />
    default:
      return null
  }
}
