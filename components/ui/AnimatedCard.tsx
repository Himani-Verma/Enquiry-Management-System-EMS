'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  glassmorphism?: boolean;
  hoverLift?: boolean;
}

export default function AnimatedCard({ 
  children, 
  className = '', 
  glassmorphism = false,
  hoverLift = true
}: AnimatedCardProps) {
  const baseClasses = glassmorphism
    ? 'backdrop-blur-lg bg-white/10 border border-white/20'
    : 'bg-white';

  return (
    <motion.div
      className={`rounded-2xl ${baseClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={hoverLift ? { 
        y: -8, 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3 }
      } : undefined}
      style={{
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      }}
    >
      {children}
    </motion.div>
  );
}
