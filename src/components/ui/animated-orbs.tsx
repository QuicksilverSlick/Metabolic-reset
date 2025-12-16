'use client';

import { cn } from '@/lib/utils';

interface AnimatedOrbsProps {
  className?: string;
  variant?: 'default' | 'gold' | 'blue';
}

export function AnimatedOrbs({ className, variant = 'default' }: AnimatedOrbsProps) {
  const getColors = () => {
    switch (variant) {
      case 'gold':
        return {
          orb1: 'bg-gold-500/20',
          orb2: 'bg-gold-400/15',
          orb3: 'bg-amber-500/10',
        };
      case 'blue':
        return {
          orb1: 'bg-blue-500/20',
          orb2: 'bg-blue-400/15',
          orb3: 'bg-navy-500/10',
        };
      default:
        return {
          orb1: 'bg-gold-500/15',
          orb2: 'bg-blue-500/10',
          orb3: 'bg-gold-400/10',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden="true">
      {/* Orb 1 - Large, slow floating */}
      <div
        className={cn(
          'absolute w-[500px] h-[500px] rounded-full blur-[100px]',
          colors.orb1,
          'animate-float-slow'
        )}
        style={{
          top: '10%',
          right: '-10%',
          animation: 'float-slow 20s ease-in-out infinite',
        }}
      />
      {/* Orb 2 - Medium, different timing */}
      <div
        className={cn(
          'absolute w-[400px] h-[400px] rounded-full blur-[80px]',
          colors.orb2,
          'animate-float-medium'
        )}
        style={{
          bottom: '20%',
          left: '-5%',
          animation: 'float-medium 15s ease-in-out infinite reverse',
        }}
      />
      {/* Orb 3 - Small accent */}
      <div
        className={cn(
          'absolute w-[300px] h-[300px] rounded-full blur-[60px]',
          colors.orb3
        )}
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'pulse-glow 10s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(-30px, 20px) scale(1.05);
          }
          50% {
            transform: translate(-10px, -30px) scale(0.95);
          }
          75% {
            transform: translate(20px, 10px) scale(1.02);
          }
        }
        @keyframes float-medium {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(25px, -25px) scale(1.03);
          }
          66% {
            transform: translate(-20px, 15px) scale(0.97);
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
