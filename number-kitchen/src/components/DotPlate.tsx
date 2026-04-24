import { motion } from 'framer-motion'
import { colors } from '../shared/tokens'
import { DOT_POSITIONS } from '../shared/session'

interface Props {
  count: number
  visible?: boolean
}

export default function DotPlate({ count, visible = true }: Props) {
  const positions = DOT_POSITIONS[count] ?? []

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.92 }}
      transition={{ duration: 0.28 }}
      style={{
        width: 'min(40vw, 270px)',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 40%, #FFF8EB 0%, #F0E8D8 68%, #E9DEC9 100%)',
        border: `4px solid ${'#C4A47C'}`,
        boxShadow: '0 10px 28px rgba(139,94,60,0.18)',
        position: 'relative',
      }}
      aria-hidden={!visible}
    >
      <div
        style={{
          position: 'absolute',
          inset: '4%',
          borderRadius: '50%',
          border: `2px solid ${colors.softShadow}`,
          opacity: 0.95,
        }}
      />
      {positions.map(([x, y], index) => (
        <motion.div
          key={`${count}-${index}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: visible ? 1 : 0.8, opacity: visible ? 1 : 0 }}
          transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 260, damping: 18 }}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            width: count <= 3 ? 44 : 36,
            height: count <= 3 ? 44 : 36,
            borderRadius: '50%',
            background: colors.terracotta,
            boxShadow: 'inset -4px -6px 0 rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '24%',
              top: '20%',
              width: '26%',
              height: '18%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.65)',
              transform: 'rotate(-30deg)',
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
