'use client';

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, useId } from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
}

export const BorderBeam = ({
  className,
  size = 120,
  duration = 4,
  delay = 0,
  colorFrom = "#fde68a",
  colorTo = "#f59e0b",
  borderWidth = 2,
}: BorderBeamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const uniqueId = useId().replace(/:/g, '');

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const parent = containerRef.current.parentElement;
        if (parent) {
          const rect = parent.getBoundingClientRect();
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    updateDimensions();
    const timer = setTimeout(updateDimensions, 50);
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      clearTimeout(timer);
    };
  }, []);

  const { width, height } = dimensions;

  if (width === 0 || height === 0) {
    return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;
  }

  // For pill-shaped buttons, radius is half the height
  const radius = height / 2;

  // Create a single continuous path around the pill shape (clockwise from top-left)
  // Starting from top-left corner, going right along top, around right cap, back along bottom, around left cap
  const pathD = `
    M ${radius} 0
    L ${width - radius} 0
    A ${radius} ${radius} 0 0 1 ${width - radius} ${height}
    L ${radius} ${height}
    A ${radius} ${radius} 0 0 1 ${radius} 0
    Z
  `;

  // Calculate perimeter for animation
  const straightParts = 2 * (width - 2 * radius);
  const curvedParts = 2 * Math.PI * radius;
  const perimeter = straightParts + curvedParts;

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-visible",
        className
      )}
    >
      <svg
        className="absolute inset-0 overflow-visible"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradient for the beam - bright head fading to transparent tail */}
          <linearGradient id={`beam-grad-${uniqueId}`}>
            {/* Tail - transparent */}
            <stop offset="0%" stopColor={colorFrom} stopOpacity="0" />
            <stop offset="10%" stopColor={colorFrom} stopOpacity="0.1" />
            <stop offset="30%" stopColor={colorFrom} stopOpacity="0.4" />
            <stop offset="60%" stopColor={colorFrom} stopOpacity="0.8" />
            {/* Head - bright and solid */}
            <stop offset="85%" stopColor={colorTo} stopOpacity="1" />
            <stop offset="100%" stopColor={colorTo} stopOpacity="1" />
          </linearGradient>

          {/* Glow filter for the bright head */}
          <filter id={`glow-${uniqueId}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* The animated beam */}
        <path
          d={pathD}
          stroke={`url(#beam-grad-${uniqueId})`}
          strokeWidth={borderWidth + 2}
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${uniqueId})`}
          style={{
            strokeDasharray: `${size} ${perimeter}`,
            strokeDashoffset: 0,
            animation: `beam-rotate-${uniqueId} ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        />
      </svg>

      <style>{`
        @keyframes beam-rotate-${uniqueId} {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -${perimeter};
          }
        }
      `}</style>
    </div>
  );
};
