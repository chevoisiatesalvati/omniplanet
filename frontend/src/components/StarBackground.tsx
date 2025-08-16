'use client';

import { useMemo } from 'react';

/**
 * StarBackground component that renders animated stars
 */
export default function StarBackground() {
  // Generate random star positions to avoid hydration errors
  const starPositions = useMemo(() => {
    const positions = [];
    const numStars = 150;

    // Simple pure randomness - no patterns, no grids, no algorithms
    for (let i = 0; i < numStars; i++) {
      positions.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 5 + Math.random() * 12,
        scale: 0.1 + Math.random() * 0.9,
        opacity: 0.1 + Math.random() * 0.9,
      });
    }

    return positions;
  }, []);

  return (
    <div className='absolute inset-0'>
      {starPositions.map((star, i) => (
        <div
          key={`star-${Math.random()}-${i}`}
          className='absolute w-1 h-1 bg-white rounded-full'
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            animation: `starBrighten ${star.duration}s ease-in-out infinite`,
            opacity: star.opacity,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes starBrighten {
          0%,
          100% {
            opacity: 0.1;
            transform: scale(0.8);
          }
          25% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
          75% {
            opacity: 0.6;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
