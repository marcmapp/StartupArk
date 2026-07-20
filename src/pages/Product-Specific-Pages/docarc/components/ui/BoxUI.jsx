// BoxUI.jsx - flat monoline HUD panel: single stair-step notch at the
// top-left corner (not a 45° chamfer), thin uniform strokes, a bottom-left
// comb/pin tick detail, and no glow at rest — cyan is reserved for the
// selected/expanded state only. Matches the reference HUD-panel art.
import React, { forwardRef } from 'react';

const NOTCH = 16;

const BoxUI = forwardRef(({
  title,
  content,
  priority = 'medium',
  width = 380,
  height = 220,
  topPosition = 0,
  bottomPosition = 1,
  sidesVisible = true,
  cornersVisible = true,
  contentVisible = true,
  blinkActive = false,
  isDragging = false,
  isSelected = false,
  isExpanded = false,
  className = '',
  style = {},
  onMouseDown
}, ref) => {
  const blinkStyle = blinkActive ? {
    filter: 'brightness(2)',
    boxShadow: '0 0 15px 2px rgba(255, 255, 255, 0.9)',
  } : {};

  const selectionStyle = isSelected ? {
    border: '1.5px solid #00ffff',
    boxShadow: '0 0 16px rgba(0, 255, 255, 0.35)',
  } : {
    border: '1px solid rgba(255, 255, 255, 0.5)',
  };

  const expandedStyle = isExpanded ? {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1.5px solid #00ffff',
    boxShadow: '0 0 24px rgba(0, 255, 255, 0.25)',
  } : {};

  const clipPath = `polygon(0 ${NOTCH}px, ${NOTCH}px ${NOTCH}px, ${NOTCH}px 0, 100% 0, 100% 100%, 0 100%)`;

  return (
    <div
      className={`absolute font-mono ${isDragging ? 'cursor-grabbing z-50' : 'cursor-pointer'} ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        clipPath,
        ...selectionStyle,
        ...expandedStyle,
        ...style,
        transition: 'all 0.3s ease-out'
      }}
      onMouseDown={onMouseDown}
    >
      {/* TOP LINE */}
      <div
        className="absolute h-[1px] bg-white"
        style={{
          left: '0px',
          right: '0px',
          top: `${height * topPosition - 0.5}px`,
          opacity: topPosition === 0.5 ? 0 : 1,
          ...blinkStyle,
        }}
      ></div>

      {/* BOTTOM LINE */}
      <div
        className="absolute h-[1px] bg-white"
        style={{
          left: '0px',
          right: '0px',
          top: `${height * bottomPosition - 0.5}px`,
          opacity: bottomPosition === 0.5 ? 0 : 1,
          ...blinkStyle,
        }}
      ></div>

      {/* LEFT SIDE */}
      <div
        className="absolute w-[1px] bg-white"
        style={{
          top: '0px',
          height: `${height}px`,
          left: '0px',
          opacity: sidesVisible ? 1 : 0,
        }}
      ></div>

      {/* RIGHT SIDE */}
      <div
        className="absolute w-[1px] bg-white"
        style={{
          top: '0px',
          height: `${height}px`,
          right: '0px',
          opacity: sidesVisible ? 1 : 0,
        }}
      ></div>

      {/* NOTCH ACCENT — bookmark/flag icon sitting in the top-left stair-step */}
      {cornersVisible && (
        <>
          <svg
            className="absolute"
            style={{ top: '2px', left: '2px' }}
            width="14"
            height="18"
            viewBox="0 0 14 18"
            fill="none"
          >
            <path
              d="M1.5 1.5 H12.5 V15.5 L7 11.5 L1.5 15.5 Z"
              stroke={isSelected ? '#00ffff' : 'rgba(255,255,255,0.7)'}
              strokeWidth="1.2"
            />
          </svg>

          {/* BOTTOM-LEFT COMB / PIN DETAIL */}
          <div
            className="absolute flex items-end gap-[2px]"
            style={{ left: '10px', bottom: '0px', height: '8px' }}
          >
            {[3, 5, 4, 6, 3].map((h, idx) => (
              <div
                key={idx}
                style={{
                  width: '1.5px',
                  height: `${h}px`,
                  backgroundColor: isSelected ? 'rgba(0,255,255,0.6)' : 'rgba(255,255,255,0.4)',
                }}
              ></div>
            ))}
          </div>
        </>
      )}

      {/* CONTENT AREA - Fixed to use all available space */}
      <div
        ref={ref}
        className="absolute inset-0 p-4 flex flex-col"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: contentVisible ? 'opacity 0.4s ease-out' : 'none',
        }}
      >
        {/* Title section - takes only needed space */}
        {title && (
          <div className="mb-2 flex-shrink-0" style={{ paddingLeft: `${NOTCH - 8}px` }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: isSelected ? '#00ffff' : 'white',
                }}
              ></div>
              <h3
                className="text-xs font-bold tracking-wider uppercase truncate"
                style={{
                  color: isSelected ? '#00ffff' : 'white',
                }}
              >
                {title}
              </h3>
              {priority && (
                <span
                  className="text-[10px] tracking-wider ml-auto flex-shrink-0"
                  style={{
                    color: isSelected ? 'rgba(0, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  [{priority.toUpperCase()}]
                </span>
              )}
            </div>

            {/* DIVIDER */}
            <div
              className="mt-2 h-[1px]"
              style={{
                backgroundColor: isSelected ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.25)',
              }}
            ></div>
          </div>
        )}

        {/* Content text - flexible area */}
        {content && (
          <div
            className="text-xs leading-relaxed tracking-wide flex-1 overflow-hidden"
            style={{
              color: isSelected ? 'rgba(0, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.85)',
            }}
          >
            <div className="whitespace-pre-wrap break-words h-full">
              {content}
            </div>
          </div>
        )}

        {/* Drag hint - fixed at bottom */}
        <div
          className="pt-2 border-t text-[10px] flex-shrink-0 mt-2"
          style={{
            borderColor: isSelected ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)',
            color: isSelected ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <svg
              className="w-2.5 h-2.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{
                color: isSelected ? '#00ffff' : 'currentColor',
              }}
            >
              <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>Click to connect • Drag to move</span>
          </div>
        </div>
      </div>
    </div>
  );
});

BoxUI.displayName = 'BoxUI';

export default BoxUI;
