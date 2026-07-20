// DocArc.jsx — ported from the standalone "Doc" R&D prototype, then reworked
// into a reactor-core HUD composition: left info panel removed, orbit
// recentered on the Arc, circuit lines rebuilt as technical schematic
// linework, and cards redesigned as compact chamfered HUD panels.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Box from './components/Box';
import contentData from './data/content.json';
import Arc from './components/Arc';
import ArcReactorRing from './components/ArcReactorRing';
import ConnectorLines from './components/ConnectorLines';

const CARD_W = 300;
const CARD_H = 170;
const CARD_EXPANDED_W = 380;
const CARD_EXPANDED_H = 260;
const HUB_X_RATIO = 0.38;
const REACTOR_SCALE = 1.18;
// Sections sit 20° apart (10 cards over a 180° sweep). For the closest pair
// (±10°) to clear vertically at a typical ~900px innerHeight, radius needs
// 2 * radius * sin(10°) to exceed the pair's combined scaled half-heights
// (~167px) — solving that gives roughly this ratio, with a little headroom.
const ORBIT_RADIUS_RATIO = 0.58;

const DocArc = () => {
  const [positions, setPositions] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [connections, setConnections] = useState([]);
  const containerRef = useRef(null);

  /* =====================================================
     INVERTED SEMI-CIRCULAR ORBIT — centered directly on the Arc
  ===================================================== */
  const calculatePositions = useCallback((offset = 0) => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const centerX = w * HUB_X_RATIO;
    const centerY = h * 0.5;
    // Radius is large relative to card size on purpose: with a fixed 20°
    // step between the 10 sections, the vertical gap between adjacent cards
    // has to exceed their (scaled) height or they cascade into an
    // overlapping stack. See ORBIT_RADIUS_RATIO comment below for the math.
    const radius = Math.min(w, h) * ORBIT_RADIUS_RATIO;

    const total = contentData.sections.length;

    const angleStart = -Math.PI / 2;
    const angleEnd = Math.PI / 2;
    const step = (angleEnd - angleStart) / (total - 1);

    return contentData.sections.map((_, i) => {
      const angle = angleStart + i * step + offset;

      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const distanceFromCenter = Math.abs(angle);
      const depth = Math.max(0, 1 - distanceFromCenter / 1.4);

      // Hide anything past the innermost two pairs — keeping only 4 cards
      // in view at once is what makes the wider spacing above actually read
      // as separated cards instead of a crowded stack.
      const isHidden = depth < 0.4;

      return {
        left: x - CARD_W / 2,
        top: y - CARD_H / 2,
        scale: 0.5 + depth * 0.55,
        opacity: isHidden ? 0 : 0.3 + depth * 0.7,
        zIndex: Math.floor(depth * 100),
        isHidden,
      };
    });
  }, []);

  /* =====================================================
     SCROLL HANDLER WITH BOUNDARIES
  ===================================================== */
  const handleWheel = useCallback(
    (e) => {
      if (expanded !== null) return;
      e.preventDefault();

      setScrollOffset((prev) => {
        const delta = e.deltaY > 0 ? -0.18 : 0.18;
        const next = prev + delta;

        const maxOffset = 1.4;
        const minOffset = -1.4;

        const clampedNext = Math.max(minOffset, Math.min(maxOffset, next));

        setPositions(calculatePositions(clampedNext));
        return clampedNext;
      });
    },
    [expanded, calculatePositions]
  );

  /* =====================================================
     CARD SELECT — draws an energy line from the reactor core
     out to the orbit slot the card was pulled from.
  ===================================================== */
  const handleSelect = (index) => {
    if (expanded === index) {
      handleClose();
      return;
    }

    const p = positions[index];

    setExpanded(index);
    setConnections([
      {
        id: index,
        startX: window.innerWidth * HUB_X_RATIO,
        startY: window.innerHeight / 2,
        endX: p ? p.left + CARD_W / 2 : window.innerWidth * HUB_X_RATIO,
        endY: p ? p.top + CARD_H / 2 : window.innerHeight / 2,
      },
    ]);
  };

  /* =====================================================
     CLOSE CARD WHEN CLICKING ANYWHERE
  ===================================================== */
  const handleClose = useCallback(() => {
    setExpanded(null);
    setConnections([]);
    setPositions(calculatePositions(scrollOffset));
  }, [scrollOffset, calculatePositions]);

  /* =====================================================
     INIT + RESIZE
  ===================================================== */
  useEffect(() => {
    const init = () => setPositions(calculatePositions(scrollOffset));
    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, [calculatePositions, scrollOffset]);

  /* =====================================================
     WHEEL LISTENER
  ===================================================== */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  /* =====================================================
     CLOSE CARD ON CLICK OUTSIDE
  ===================================================== */
  const handleContainerClick = useCallback((e) => {
    if (expanded !== null && e.target === containerRef.current) {
      handleClose();
    }
  }, [expanded, handleClose]);

  const hubX = typeof window !== 'undefined' ? window.innerWidth * HUB_X_RATIO : 0;
  const hubY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  const hubLeft = `${HUB_X_RATIO * 100}%`;

  return (
    <Container ref={containerRef} onClick={handleContainerClick}>
      {/* ARC REACTOR - bezel rings + fins layered around the core animation */}
      <ArcWrap style={{ left: hubLeft }}>
        <ArcReactorRing />
        <Arc />
      </ArcWrap>

      {/* CONNECTOR LINES - live wires from the reactor core to each visible card */}
      <ConnectorLines
        sections={contentData.sections}
        positions={positions}
        expanded={expanded}
        hubX={hubX}
        hubY={hubY}
        cardW={CARD_W}
        cardH={CARD_H}
      />

      {/* HUD CORNER READOUTS */}
      <HudCorner className="top-left">
        <HudTitle>DOC ARC</HudTitle>
        <HudSubtitle>INTELLIGENCE CORE</HudSubtitle>
        <HudLine><HudDot />SEC.PROTOCOL <span>ACTIVE</span></HudLine>
        <HudLine>ENCRYPTION <span>AES-256</span></HudLine>
      </HudCorner>
      <HudCorner className="bottom-right">
        <HudLine>NODE.SYNC <span>100%</span></HudLine>
        <HudLine><HudDot />UPLINK <span>STABLE</span></HudLine>
      </HudCorner>

      {/* TECH LINES */}
      <svg className="lines">
        {connections.map((c) => (
          <TechLine key={c.id} {...c} />
        ))}
      </svg>

      {/* CARDS */}
      {contentData.sections.map((s, i) => {
        const p = positions[i];
        if (!p) return null;

        const isExpanded = expanded === i;

        if (p.isHidden && !isExpanded) return null;

        return (
          <motion.div
            key={s.id}
            initial={false}
            animate={{
              x: isExpanded ? window.innerWidth / 2 - CARD_EXPANDED_W / 2 : p.left,
              y: isExpanded ? window.innerHeight / 2 - CARD_EXPANDED_H / 2 : p.top,
              scale: isExpanded ? 1.15 : p.scale,
              opacity: isExpanded ? 1 : expanded ? 0.15 : p.opacity,
              zIndex: isExpanded ? 1000 : p.zIndex,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            style={{ position: 'absolute' }}
          >
            <Box
              title={s.title}
              content={s.content}
              priority={s.priority}
              index={i}
              isExpanded={isExpanded}
              onSelect={() => handleSelect(i)}
              style={{
                width: isExpanded ? CARD_EXPANDED_W : CARD_W,
                height: isExpanded ? CARD_EXPANDED_H : CARD_H,
              }}
            />
          </motion.div>
        );
      })}
    </Container>
  );
};

export default DocArc;

/* =====================================================
   TECH LINE
===================================================== */
const TechLine = ({ startX, startY, endX, endY }) => {
  const midX = (startX + endX) / 2;
  return (
    <>
      <path
        d={`M ${startX} ${startY} Q ${midX} ${startY} ${endX} ${endY}`}
        stroke="#00ffff"
        strokeWidth="2"
        fill="none"
      />
      <circle cx={startX} cy={startY} r="4" fill="#00ffff" />
      <circle cx={endX} cy={endY} r="4" fill="#ffffff" />
    </>
  );
};

/* =====================================================
   STYLES
===================================================== */
const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1;
  background: #000000;
  overflow: hidden;
  cursor: pointer;

  .lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
`;

const ArcWrap = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(${REACTOR_SCALE});
  filter: drop-shadow(0 0 30px rgba(0,255,255,0.5));
  z-index: 0;
`;

const HudCorner = styled.div`
  position: absolute;
  z-index: 2;
  pointer-events: none;
  font-family: 'Courier New', monospace;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: rgba(0, 255, 255, 0.55);
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.top-left {
    top: 28px;
    left: 28px;
  }

  &.bottom-right {
    bottom: 28px;
    right: 28px;
    align-items: flex-end;
    text-align: right;
  }
`;

const HudTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 4px;
  color: #ffffff;
`;

const HudSubtitle = styled.div`
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(0, 255, 255, 0.55);
  margin-bottom: 8px;
`;

const HudLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    color: #ffffff;
  }
`;

const HudDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #00ffff;
  flex-shrink: 0;
`;
