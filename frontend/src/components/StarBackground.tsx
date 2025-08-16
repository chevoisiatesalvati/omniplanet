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
        delay: Math.random() * 6,
        duration: 0.5 + Math.random() * 5,
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
          className='absolute w-1 h-1 bg-white rounded-full animate-pulse'
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
