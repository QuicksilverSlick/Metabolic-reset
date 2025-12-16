'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  stat?: {
    value: string;
    label: string;
  };
  index?: number;
  className?: string;
}

/**
 * FeatureCard - Apple Liquid Glass-inspired glassmorphism card
 *
 * Features:
 * - Deep navy glassmorphism with backdrop blur (iOS 26 style)
 * - Crisp, sharp icons with increased stroke width
 * - Subtle layered depth with box shadows
 * - Mobile-first responsive design
 * - Touch-friendly interactions
 * - Reduced motion support
 */
export function FeatureCard({
  icon,
  title,
  description,
  stat,
  index = 0,
  className,
}: FeatureCardProps) {
  const [isActive, setIsActive] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsActive(true)}
      onHoverEnd={() => setIsActive(false)}
      onTapStart={() => setIsActive(true)}
      onTap={() => setTimeout(() => setIsActive(false), 300)}
      className={cn(
        // Base mobile styles
        "feature-card relative p-6 sm:p-8 rounded-2xl",
        // Apple Liquid Glass: layered transparency with stronger blur
        "bg-white/[0.04] backdrop-blur-xl",
        // Combined shadow: outer depth + inner navy shadow for glass edge depth (stronger)
        "shadow-[0_8px_32px_rgba(15,23,42,0.4),inset_0_0_0_2px_rgba(15,23,42,0.5),inset_0_3px_6px_rgba(15,23,42,0.4)]",
        // Enhanced border - more visible glass edge (white highlight)
        "border border-white/[0.18]",
        // Transition
        "transition-all duration-300",
        // Active state - enhanced glass effect with stronger border and inner shadow
        isActive && "bg-white/[0.07] border-white/[0.3] shadow-[0_12px_40px_rgba(15,23,42,0.5),inset_0_0_0_2px_rgba(15,23,42,0.6),inset_0_4px_8px_rgba(15,23,42,0.5)]",
        className
      )}
    >
      {/* Liquid Glass gradient overlay - deep navy tones for depth */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 pointer-events-none",
          "bg-gradient-to-br from-slate-400/[0.04] via-[#0F172A]/[0.25] to-[#020617]/[0.4]",
          isActive && "opacity-100"
        )}
      />

      {/* Content container */}
      <div className="relative z-10">
        {/* Icon container - glassmorphism style */}
        <motion.div
          className={cn(
            // Mobile-first: compact size
            "w-12 h-12 rounded-xl flex items-center justify-center mb-5",
            // Tablet+: slightly larger
            "sm:w-14 sm:h-14 md:w-16 md:h-16 sm:rounded-xl md:mb-6",
            // Glassmorphism background with stronger border
            "bg-white/[0.08] backdrop-blur-md",
            "border border-white/[0.18]",
            // Inner shadow: navy depth inside + subtle white highlight on top (stronger)
            "shadow-[inset_0_0_0_1.5px_rgba(15,23,42,0.4),inset_0_2px_4px_rgba(15,23,42,0.35),inset_0_-1px_1px_rgba(255,255,255,0.06)]",
            // Active state with even stronger border and inner shadow
            isActive && "bg-white/[0.12] border-white/[0.3] shadow-[inset_0_0_0_2px_rgba(15,23,42,0.5),inset_0_3px_5px_rgba(15,23,42,0.4),inset_0_-1px_1px_rgba(255,255,255,0.1)]"
          )}
          animate={isActive ? { scale: [1, 1.03, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Sharp, crisp icon styling */}
          <div
            className={cn(
              "text-gold-400",
              // Crisp icon sizing with sharp stroke
              "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
              // Force sharp rendering and thicker strokes
              "[&>svg]:w-full [&>svg]:h-full",
              "[&>svg]:stroke-[2.5]",
              // Ensure crisp edges
              "[&>svg]:shape-rendering-geometricPrecision"
            )}
          >
            {icon}
          </div>
        </motion.div>

        {/* Stat badge - glassmorphism style */}
        {stat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={cn(
              // Mobile: inline badge
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4",
              // Glassmorphism background with stronger border
              "bg-white/[0.08] backdrop-blur-sm",
              "border border-white/[0.18]",
              // Inner shadow: navy depth inside for glass edge contrast (stronger)
              "shadow-[inset_0_0_0_1.5px_rgba(15,23,42,0.4),inset_0_2px_3px_rgba(15,23,42,0.3)]",
              // Text
              "text-xs sm:text-sm font-semibold"
            )}
          >
            <span className="text-gold-400">{stat.value}</span>
            <span className="text-slate-400">{stat.label}</span>
          </motion.div>
        )}

        {/* Title - responsive sizing */}
        <h3 className={cn(
          // Mobile-first
          "text-lg font-bold text-white mb-2 font-display",
          // Tablet+
          "sm:text-xl md:text-2xl sm:mb-3"
        )}>
          {title}
        </h3>

        {/* Description - responsive sizing */}
        <p className={cn(
          // Mobile-first
          "text-sm text-slate-400 leading-relaxed font-sans",
          // Tablet+
          "sm:text-base md:text-lg"
        )}>
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default FeatureCard;
