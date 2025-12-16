'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Step {
  step: string;
  title: string;
  desc: string;
}

interface AnimatedStepsProps {
  steps: Step[];
  className?: string;
}

export function AnimatedSteps({ steps, className = '' }: AnimatedStepsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const stepVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  const circleVariants = {
    hidden: {
      scale: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 0.1,
      },
    },
  };

  const numberVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  };

  const lineVariants = {
    hidden: {
      scaleX: 0,
      originX: 0,
    },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.4,
      },
    },
  };

  const pulseRingVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: [1, 1.3, 1],
      opacity: [0.5, 0, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className={`grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Animated connecting line - desktop only */}
      <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-1 z-0 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-500/50 via-gold-500 to-gold-500/50 rounded-full"
          variants={lineVariants}
        />
        {/* Animated glow effect on line */}
        <motion.div
          className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
          style={{ width: '30%' }}
        />
      </div>

      {steps.map((item, i) => (
        <motion.div
          key={i}
          className="relative z-10 flex flex-col items-center text-center group"
          variants={stepVariants}
        >
          {/* Step circle with animations */}
          <div className="relative mb-8">
            {/* Outer pulse ring */}
            <motion.div
              className="absolute inset-0 w-32 h-32 rounded-full bg-gold-500/20"
              variants={pulseRingVariants}
            />

            {/* Main circle */}
            <motion.div
              className="relative w-32 h-32 rounded-full bg-navy-800 border-4 border-navy-700 flex items-center justify-center shadow-[0_0_30px_rgba(15,44,89,0.5)] group-hover:border-gold-500 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all duration-500"
              variants={circleVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
            >
              {/* Inner glow ring */}
              <motion.div
                className="absolute inset-2 rounded-full border-2 border-gold-500/20 group-hover:border-gold-500/40"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              {/* Step number */}
              <motion.span
                className="font-display font-bold text-4xl text-gold-500 group-hover:text-white transition-colors duration-300 relative z-10"
                variants={numberVariants}
              >
                {item.step}
              </motion.span>

              {/* Hover glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gold-500/0 group-hover:bg-gold-500/10 transition-all duration-500"
              />
            </motion.div>

            {/* Decorative dots around circle */}
            {[0, 60, 120, 180, 240, 300].map((angle, dotIndex) => (
              <motion.div
                key={dotIndex}
                className="absolute w-2 h-2 bg-gold-500/40 rounded-full"
                style={{
                  top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
                  left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? {
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: dotIndex * 0.2 + i * 0.3,
                }}
              />
            ))}
          </div>

          {/* Text content with staggered animation */}
          <motion.h3
            className="text-2xl font-bold mb-4 font-display text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 + i * 0.3, duration: 0.4 }}
          >
            {item.title}
          </motion.h3>
          <motion.p
            className="text-slate-300 text-lg leading-relaxed font-sans max-w-xs"
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 + i * 0.3, duration: 0.4 }}
          >
            {item.desc}
          </motion.p>

          {/* Mobile connecting line */}
          {i < steps.length - 1 && (
            <motion.div
              className="md:hidden w-1 h-12 mt-8 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 + i * 0.3 }}
            >
              <motion.div
                className="w-full h-full bg-gradient-to-b from-gold-500 to-gold-500/30"
                initial={{ scaleY: 0, originY: 0 }}
                animate={isInView ? { scaleY: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.3 }}
              />
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
