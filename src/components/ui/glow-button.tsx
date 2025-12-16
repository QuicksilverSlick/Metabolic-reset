'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface GlowWrapperProps {
  children: React.ReactNode;
  glowColor?: 'gold' | 'rainbow';
  className?: string;
}

/**
 * GlowWrapper - Wraps any button to add an animated glow border effect
 *
 * Usage:
 * <GlowWrapper>
 *   <Button>Your existing button</Button>
 * </GlowWrapper>
 */
export function GlowWrapper({ children, glowColor = 'gold', className }: GlowWrapperProps) {
  const gradientClass = glowColor === 'rainbow'
    ? 'glow-button-rainbow'
    : 'glow-button-gold';

  return (
    <div className={cn('glow-button-wrapper relative inline-flex', gradientClass, className)}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Keep GlowButton as alias for backwards compatibility
export const GlowButton = GlowWrapper;
