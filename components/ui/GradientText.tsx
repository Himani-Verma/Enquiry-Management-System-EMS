import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export default function GradientText({ 
  children, 
  className = '', 
  from = '#2d4891', 
  to = '#16a34a' 
}: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(to right, ${from}, ${to})`,
      }}
    >
      {children}
    </span>
  );
}
