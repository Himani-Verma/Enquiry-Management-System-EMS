'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: string | number;
  className?: string;
  duration?: number;
}

export default function AnimatedCounter({ 
  value, 
  className = '',
  duration = 2
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(value);

  // Check if value is a number
  const numericValue = typeof value === 'number' ? value : parseInt(value);
  const isNumeric = !isNaN(numericValue);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView && isNumeric) {
      motionValue.set(numericValue);
    }
  }, [isInView, numericValue, motionValue, isNumeric]);

  useEffect(() => {
    if (isNumeric) {
      const unsubscribe = springValue.on('change', (latest) => {
        setDisplayValue(Math.round(latest).toString());
      });
      return unsubscribe;
    }
  }, [springValue, isNumeric]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isNumeric ? displayValue : value}
    </motion.span>
  );
}
