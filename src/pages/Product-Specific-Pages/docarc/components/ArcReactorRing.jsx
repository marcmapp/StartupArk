// ArcReactorRing.jsx — monoline HUD dial matching the reference art:
// a knurled/segmented mid ring (dashed circle, not individual tick lines),
// an asymmetric hatch band on one arc, an inner dashed ring, and a reticle
// crosshair with inward-pointing chevrons at its four tips.
import React, { useMemo } from 'react';
import styled from 'styled-components';

const HATCH_COUNT = 40;
const DOT_ANGLES = [255, 268, 281];

function buildHatches() {
  return Array.from({ length: HATCH_COUNT }, (_, i) => {
    const angle = (i / HATCH_COUNT) * 360;
    const inDenseBand = angle >= 300 || angle <= 60;
    if (!inDenseBand && i % 3 !== 0) return null;
    return { id: `hatch-${i}`, angle, major: i % 8 === 0 };
  }).filter(Boolean);
}

const ArcReactorRing = () => {
  const hatches = useMemo(buildHatches, []);

  return (
    <Wrap width={440} height={440} viewBox="-220 -220 440 440">
      {/* outer thin ring */}
      <circle className="ring-outer" r="150" />

      {/* asymmetric tick / hatch band */}
      <g className="hatch-band">
        {hatches.map((t) => (
          <line
            key={t.id}
            className={t.major ? 'hatch hatch-major' : 'hatch'}
            x1="0"
            y1="-130"
            x2="0"
            y2={t.major ? -145 : -138}
            transform={`rotate(${t.angle})`}
          />
        ))}
      </g>

      {/* knurled / segmented mid ring */}
      <circle className="ring-knurled" r="118" />

      {/* inner dashed ring */}
      <circle className="ring-inner" r="86" />

      {/* reticle crosshair with inward chevrons at each tip */}
      <g className="crosshair">
        <line x1="0" y1="-205" x2="0" y2="-96" />
        <line x1="0" y1="96" x2="0" y2="205" />
        <line x1="-205" y1="0" x2="-96" y2="0" />
        <line x1="96" y1="0" x2="205" y2="0" />

        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            className="chevron"
            d="M 7 -7 L -7 0 L 7 7 Z"
            transform={`rotate(${angle}) translate(190 0)`}
          />
        ))}
      </g>

      {/* bottom dot cluster */}
      {DOT_ANGLES.map((angle, i) => (
        <circle
          key={angle}
          className="dot"
          cx={172 * Math.cos((angle * Math.PI) / 180)}
          cy={172 * Math.sin((angle * Math.PI) / 180)}
          r={i === 1 ? 3 : 2}
        />
      ))}

      {/* breathing core glow, sits behind Arc's own center dot */}
      <circle className="core-glow" r="16" />
    </Wrap>
  );
};

export default ArcReactorRing;

const Wrap = styled.svg`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow: visible;
  pointer-events: none;
  z-index: 0;

  line, circle, path {
    fill: none;
  }

  .ring-outer {
    stroke: rgba(255, 255, 255, 0.35);
    stroke-width: 1;
  }

  .hatch-band {
    animation: spin 110s linear infinite;
    transform-origin: 0 0;
  }

  .hatch {
    stroke: rgba(255, 255, 255, 0.3);
    stroke-width: 1;
  }

  .hatch-major {
    stroke: rgba(0, 255, 255, 0.6);
    stroke-width: 1.4;
  }

  .ring-knurled {
    stroke: rgba(255, 255, 255, 0.6);
    stroke-width: 8;
    stroke-dasharray: 10 5;
    animation: spinReverse 130s linear infinite;
    transform-origin: 0 0;
  }

  .ring-inner {
    stroke: rgba(255, 255, 255, 0.4);
    stroke-width: 1;
    stroke-dasharray: 4 4;
    animation: spin 70s linear infinite;
    transform-origin: 0 0;
  }

  .crosshair line {
    stroke: rgba(255, 255, 255, 0.4);
    stroke-width: 1;
  }

  .chevron {
    fill: rgba(0, 255, 255, 0.65);
  }

  .dot {
    fill: rgba(255, 255, 255, 0.5);
  }

  .core-glow {
    fill: rgba(0, 255, 255, 0.16);
    filter: blur(7px);
    animation: breathe 2.8s ease-in-out infinite;
    transform-origin: 0 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes spinReverse {
    to { transform: rotate(-360deg); }
  }

  @keyframes breathe {
    0%, 100% { transform: scale(0.85); opacity: 0.6; }
    50% { transform: scale(1.15); opacity: 1; }
  }
`;
