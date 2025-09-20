import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface ParticleBackgroundProps {
  particleCount?: number;
  colors?: string[];
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  particleCount = 50,
  colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particles: HTMLElement[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle gpu-accelerated';

      // Random size
      const sizeClass = Math.random() > 0.7 ? 'particle-large' : Math.random() > 0.3 ? 'particle' : 'particle-small';
      particle.classList.add(sizeClass);

      // Random color
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = `radial-gradient(circle, ${color}80, transparent)`;

      // Random position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';

      // Random animation
      const animations = ['particle-1', 'particle-2', 'particle-3', 'floating-shapes'];
      const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
      particle.classList.add(randomAnimation);

      // Random delay
      particle.style.animationDelay = Math.random() * 3 + 's';

      // Random duration
      particle.style.animationDuration = (5 + Math.random() * 10) + 's';

      container.appendChild(particle);
      particles.push(particle);
    }

    // Cleanup function
    return () => {
      particles.forEach(particle => {
        if (container.contains(particle)) {
          container.removeChild(particle);
        }
      });
    };
  }, [particleCount, colors]);

  return (
    <Box
      ref={containerRef}
      className="particle-container"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};