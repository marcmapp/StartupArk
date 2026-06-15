// RadarCanvas.jsx
// Animated SVG radar. Sweep spins ONLY while scanning.
// Blips are colored bubbles with initials — click-to-select support.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateBearing } from '../../../../services/geoLocator';

const SIZE = 460;
const CENTER = SIZE / 2;
const USABLE = CENTER - 32;
const RINGS = [0.25, 0.5, 0.75, 1.0];

// Deterministic color from string for consistent startup colors
const PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
];
function colorFor(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function polarToXY(bearingDeg, distKm, maxKm) {
  const rad = ((bearingDeg - 90) * Math.PI) / 180;
  const r = Math.min(distKm / maxKm, 0.95) * USABLE;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

const R2_BASE = 'https://pub-96dbf4700a544b3b825b262291f6f0a7.r2.dev';

export default function RadarCanvas({
  results = [],
  maxRadiusKm = 50,
  userLat,
  userLng,
  isScanning = false,
  onBlipClick,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const hasGPS = userLat != null && userLng != null;

  const blips = results.slice(0, 20).map((s, i) => {
    const name = s.companyName || s.username || s.name || '';
    const bearing =
      hasGPS && s.location?.coordinates?.length === 2
        ? calculateBearing(userLat, userLng, s.location.coordinates[1], s.location.coordinates[0])
        : (i * 137.508) % 360;
    const dist = s.distanceKm ?? (i + 1) * (maxRadiusKm / 20);
    const { x, y } = polarToXY(bearing, dist, maxRadiusKm);
    const logoKey = s.logo || s.profilePicture;
    return { id: s._id, name, x, y, logoKey, dist, color: colorFor(name + s._id) };
  });

  const hoveredBlip = blips.find(b => b.id === hoveredId);

  return (
    <div className="relative select-none flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
        aria-hidden="true"
        style={{ maxWidth: '100%' }}
      >
        {/* ── Base disc ── */}
        <circle
          cx={CENTER} cy={CENTER} r={USABLE + 6}
          className="fill-zinc-100 dark:fill-zinc-900/80 stroke-black/[0.06] dark:stroke-white/[0.06]"
          strokeWidth="1"
        />

        {/* ── Outer pulse ring — always breathes ── */}
        <motion.circle
          cx={CENTER} cy={CENTER} r={USABLE + 18}
          fill="none" strokeWidth="1"
          className="stroke-zinc-300/40 dark:stroke-zinc-500/20"
          animate={{ opacity: [0.15, 0.5, 0.15], r: [USABLE + 14, USABLE + 22, USABLE + 14] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Distance rings ── */}
        {RINGS.map((r, i) => (
          <circle
            key={i}
            cx={CENTER} cy={CENTER}
            r={USABLE * r}
            fill="none"
            strokeDasharray="5 5"
            className="stroke-black/[0.07] dark:stroke-white/[0.07]"
            strokeWidth="1"
          />
        ))}

        {/* ── Crosshairs ── */}
        <line x1={CENTER} y1={CENTER - USABLE} x2={CENTER} y2={CENTER + USABLE}
          className="stroke-black/[0.06] dark:stroke-white/[0.06]" strokeWidth="1" />
        <line x1={CENTER - USABLE} y1={CENTER} x2={CENTER + USABLE} y2={CENTER}
          className="stroke-black/[0.06] dark:stroke-white/[0.06]" strokeWidth="1" />

        {/* ── SWEEP — only animates while scanning ── */}
        <AnimatePresence>
          {isScanning && (
            <motion.g
              key="sweep"
              style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 360, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.3 },
              }}
            >
              {/* Sweep sector */}
              <path
                d={`M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - USABLE} A ${USABLE} ${USABLE} 0 0 1 ${CENTER + USABLE * Math.sin((50 * Math.PI) / 180)} ${CENTER - USABLE * Math.cos((50 * Math.PI) / 180)} Z`}
                className="fill-zinc-400/20 dark:fill-zinc-300/15"
              />
              {/* Leading edge */}
              <line
                x1={CENTER} y1={CENTER}
                x2={CENTER} y2={CENTER - USABLE}
                strokeWidth="2" strokeLinecap="round"
                className="stroke-zinc-500/70 dark:stroke-zinc-200/60"
              />
            </motion.g>
          )}
        </AnimatePresence>

        {/* ── Range labels ── */}
        {RINGS.map((r, i) => (
          <text
            key={i}
            x={CENTER + 5}
            y={CENTER - USABLE * r + 12}
            fontSize="9"
            className="fill-black/25 dark:fill-white/25"
          >
            {Math.round(maxRadiusKm * r)}km
          </text>
        ))}

        {/* ── Startup / user blips ── */}
        {blips.map(({ id, name, x, y, logoKey, color }, i) => {
          const isHovered = hoveredId === id;
          const initials = name.slice(0, 2).toUpperCase() || '?';
          return (
            <motion.g
              key={id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.3, type: 'spring', stiffness: 200 }}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onBlipClick?.(id)}
            >
              {/* Glow ring on hover */}
              {isHovered && (
                <circle cx={x} cy={y} r={14} fill="none" strokeWidth="2"
                  style={{ stroke: color, opacity: 0.5 }} />
              )}
              {/* Blip circle */}
              <circle cx={x} cy={y} r={10} style={{ fill: color }} opacity={isHovered ? 1 : 0.85} />
              {/* Initials text */}
              <text
                x={x} y={y + 4}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="white"
              >
                {initials}
              </text>
              {/* Pulse ring on blip */}
              <motion.circle
                cx={x} cy={y} r={10}
                fill="none" strokeWidth="1.5"
                style={{ stroke: color }}
                animate={{ r: [10, 18, 10], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15, ease: 'easeOut' }}
              />
            </motion.g>
          );
        })}

        {/* ── User centre dot ── */}
        <circle cx={CENTER} cy={CENTER} r={7} className="fill-zinc-900 dark:fill-white" />
        <motion.circle
          cx={CENTER} cy={CENTER} r={7}
          fill="none"
          className="stroke-zinc-500 dark:stroke-zinc-400"
          strokeWidth="2"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          animate={{ scale: [1, 2.5, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </svg>

      {/* ── Hover tooltip (rendered outside SVG for crisp text) ── */}
      <AnimatePresence>
        {hoveredBlip && (
          <motion.div
            key={hoveredBlip.id}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="glass-card px-3 py-2 flex items-center gap-2 shadow-lg whitespace-nowrap">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ background: hoveredBlip.color }}
              />
              <div>
                <p className="text-xs font-semibold text-zinc-900 dark:text-white leading-tight">
                  {hoveredBlip.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {hoveredBlip.dist != null ? `${hoveredBlip.dist.toFixed(1)} km away` : 'Nearby'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
