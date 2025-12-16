'use client';

import { cn } from '@/lib/utils';

interface DotPatternProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  fade?: boolean;
  fadeDirection?: 'top' | 'bottom' | 'left' | 'right' | 'radial';
}

export function DotPattern({
  className,
  dotColor = 'rgba(245, 158, 11, 0.15)',
  dotSize = 1,
  gap = 24,
  fade = true,
  fadeDirection = 'radial',
}: DotPatternProps) {
  const getFadeMask = () => {
    switch (fadeDirection) {
      case 'top':
        return 'linear-gradient(to bottom, transparent, black 50%)';
      case 'bottom':
        return 'linear-gradient(to top, transparent, black 50%)';
      case 'left':
        return 'linear-gradient(to right, transparent, black 50%)';
      case 'right':
        return 'linear-gradient(to left, transparent, black 50%)';
      case 'radial':
      default:
        return 'radial-gradient(ellipse at center, black 30%, transparent 70%)';
    }
  };

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      aria-hidden="true"
      style={{
        backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        maskImage: fade ? getFadeMask() : undefined,
        WebkitMaskImage: fade ? getFadeMask() : undefined,
      }}
    />
  );
}
