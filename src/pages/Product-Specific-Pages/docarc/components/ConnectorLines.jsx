// ConnectorLines.jsx — single-bend schematic wires from the reactor core to
// each visible card's true facing edge (computed via rectangle/ray
// intersection, not a guess), ending in a small comb/plug detail like the
// reference art's cable terminators. Recomputed every render off the same
// `positions` state DocArc uses to place the cards, so a wire always lands
// exactly on its card.
import React from 'react';
import styled from 'styled-components';

function edgePoint(hubX, hubY, cardCx, cardCy, halfW, halfH) {
  const dx = cardCx - hubX;
  const dy = cardCy - hubY;
  const dist = Math.hypot(dx, dy) || 1;
  const cosA = dx / dist;
  const sinA = dy / dist;
  let edgeR;
  if (Math.abs(cosA) < 1e-6) edgeR = halfH / Math.abs(sinA);
  else if (Math.abs(sinA) < 1e-6) edgeR = halfW / Math.abs(cosA);
  else edgeR = Math.min(halfW / Math.abs(cosA), halfH / Math.abs(sinA));
  return { x: cardCx - cosA * edgeR, y: cardCy - sinA * edgeR };
}

const ConnectorLines = ({ sections, positions, expanded, hubX, hubY, cardW, cardH }) => {
  return (
    <Wrap>
      {sections.map((s, i) => {
        const p = positions[i];
        if (!p || p.isHidden || expanded === i) return null;

        const cardCx = p.left + cardW / 2;
        const cardCy = p.top + cardH / 2;
        const end = edgePoint(hubX, hubY, cardCx, cardCy, cardW / 2, cardH / 2);

        // Single bend: out of the ring horizontally, then straight down/up
        // into the card's facing edge.
        const bend = { x: end.x, y: hubY };
        const d = `M ${hubX.toFixed(1)} ${hubY.toFixed(1)} L ${bend.x.toFixed(1)} ${bend.y.toFixed(1)} L ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        const chevronX = (hubX + bend.x) / 2;
        const opacity = Math.min(1, p.opacity + 0.25);
        const combVertical = Math.abs(bend.y - end.y) > Math.abs(cardCx - end.x) + 1;

        return (
          <g key={s.id} style={{ opacity }}>
            <path className="connector" d={d} />
            <path className="chevron" d="M -5 -5 L 5 0 L -5 5 Z" transform={`translate(${chevronX} ${hubY})`} />
            <circle className="via" cx={bend.x} cy={bend.y} r="2.2" />

            {/* comb / plug detail at the card end */}
            <g className="comb" transform={`translate(${end.x} ${end.y})`}>
              {[-6, -2, 2, 6].map((offset) => (
                combVertical ? (
                  <line key={offset} x1={offset} y1="-3" x2={offset} y2="3" />
                ) : (
                  <line key={offset} x1="-3" y1={offset} x2="3" y2={offset} />
                )
              ))}
            </g>

            <circle className="pulse" r="2.2">
              <animateMotion dur="3.4s" repeatCount="indefinite" path={d} />
            </circle>
          </g>
        );
      })}
    </Wrap>
  );
};

export default ConnectorLines;

const Wrap = styled.svg`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  .connector {
    fill: none;
    stroke: rgba(255, 255, 255, 0.4);
    stroke-width: 1.2;
  }

  .chevron {
    fill: rgba(0, 255, 255, 0.6);
  }

  .via {
    fill: rgba(255, 255, 255, 0.6);
  }

  .comb line {
    stroke: rgba(0, 255, 255, 0.65);
    stroke-width: 1.4;
  }

  .pulse {
    fill: #ffffff;
    filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.8));
  }
`;
