'use client';

import React from 'react';

export default function AnimatedBackground() {
  // Generate random particles
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 3, // 3-8px
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: Math.random() * 20 + 20, // 20-40s
    drift: (Math.random() - 0.5) * 200, // -100 to 100px horizontal drift
  }));

  return (
    <>
      {/* Fixed background layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              bottom: '-20px',
              background: particle.id % 2 === 0 
                ? 'rgba(45, 72, 145, 0.3)' 
                : 'rgba(22, 163, 74, 0.3)',
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              '--drift': `${particle.drift}px`,
            } as React.CSSProperties}
          />
        ))}

        {/* Gradient Wave Orbs */}
        <div 
          className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-wave-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(45, 72, 145, 0.25) 0%, rgba(45, 72, 145, 0.05) 70%)',
            animationDuration: '8s',
          }}
        />
        <div 
          className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full blur-3xl animate-wave-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(22, 163, 74, 0.25) 0%, rgba(22, 163, 74, 0.05) 70%)',
            animationDuration: '10s',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full blur-3xl animate-wave-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.03) 70%)',
            animationDuration: '12s',
            animationDelay: '4s',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Geometric Shapes */}
        <div 
          className="absolute top-1/4 right-1/4 w-64 h-64 animate-slow-rotate"
          style={{
            opacity: 0.08,
            animationDuration: '90s',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon 
              points="50,10 90,30 90,70 50,90 10,70 10,30" 
              fill="none" 
              stroke="rgba(45, 72, 145, 0.5)" 
              strokeWidth="0.5"
            />
          </svg>
        </div>
        <div 
          className="absolute bottom-1/3 left-1/4 w-48 h-48 animate-slow-rotate"
          style={{
            opacity: 0.06,
            animationDuration: '120s',
            animationDirection: 'reverse',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon 
              points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
              fill="none" 
              stroke="rgba(22, 163, 74, 0.5)" 
              strokeWidth="0.5"
            />
          </svg>
        </div>
        <div 
          className="absolute top-2/3 right-1/3 w-56 h-56 animate-slow-rotate"
          style={{
            opacity: 0.07,
            animationDuration: '100s',
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="rgba(99, 102, 241, 0.5)" 
              strokeWidth="0.5"
            />
            <circle 
              cx="50" 
              cy="50" 
              r="30" 
              fill="none" 
              stroke="rgba(99, 102, 241, 0.5)" 
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) translateX(var(--drift));
            opacity: 0;
          }
        }

        @keyframes wave-pulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 0.3;
          }
        }

        @keyframes slow-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-float-particle {
          animation: float-particle linear infinite;
          will-change: transform, opacity;
        }

        .animate-wave-pulse {
          animation: wave-pulse ease-in-out infinite;
          will-change: transform, opacity;
        }

        .animate-slow-rotate {
          animation: slow-rotate linear infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-particle,
          .animate-wave-pulse,
          .animate-slow-rotate {
            animation: none !important;
            opacity: 0.1 !important;
          }
        }
      `}</style>
    </>
  );
}
