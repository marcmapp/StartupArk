// Box.jsx - Updated with rectangular proportions
import React, { useEffect, useRef, useState, useCallback } from 'react';
import BoxUI from './ui/BoxUI';

const Box = ({
  title,
  content,
  priority = 'medium',
  delay = 0,
  index = 0,
  topOffset = 0,
  leftOffset = 0,
  isSelected = false,
  isExpanded = false,
  onSelect,
  style = {}
}) => {
  const [topPosition, setTopPosition] = useState(0.5);
  const [bottomPosition, setBottomPosition] = useState(0.5);
  const [sidesVisible, setSidesVisible] = useState(false);
  const [cornersVisible, setCornersVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [blinkActive, setBlinkActive] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  const contentRef = useRef(null);

  // Animation
  useEffect(() => {
    const startDelay = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;

        const totalDuration = 1500;

        if (elapsed < totalDuration) {
          if (elapsed < 800) {
            const progress = elapsed / 800;
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);

            setTopPosition(0.5 - (easeOutCubic * 0.5));
            setBottomPosition(0.5 + (easeOutCubic * 0.5));

            if (elapsed > 300 && elapsed < 700) {
              setBlinkActive(Math.floor(elapsed / 150) % 2 === 0);
            }
          }

          if (elapsed >= 800 && elapsed < 1000) {
            setSidesVisible(true);
          }

          if (elapsed >= 1000) {
            setCornersVisible(true);
            setBlinkActive(false);
          }

          if (elapsed >= 1300) {
            setContentVisible(true);
          }

          animationRef.current = requestAnimationFrame(animate);
        } else {
          setTopPosition(0);
          setBottomPosition(1);
          setSidesVisible(true);
          setCornersVisible(true);
          setContentVisible(true);

          setTimeout(() => {
            setShowContent(true);
          }, 100);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(startDelay);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [delay]);

  // Handle click
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  }, [onSelect]);

  return (
    <BoxUI
      ref={contentRef}
      isExpanded={isExpanded}
      title={showContent ? title : ''}
      content={showContent ? content : ''}
      priority={showContent ? priority : 'medium'}
      width={style.width || 380}
      height={style.height || 220}
      topPosition={topPosition}
      bottomPosition={bottomPosition}
      sidesVisible={sidesVisible}
      cornersVisible={cornersVisible}
      contentVisible={contentVisible}
      blinkActive={blinkActive}
      isSelected={isSelected}
      style={{
        transition: `all 0.3s ease-out`,
        zIndex: 1000 + index,
        cursor: 'pointer'
      }}
      className=""
      onMouseDown={handleClick}
    />
  );
};

export default Box;
