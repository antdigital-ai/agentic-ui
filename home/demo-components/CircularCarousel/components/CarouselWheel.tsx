import React from 'react';
import { motion, useTransform } from 'framer-motion';

const ANGLE_STEP = 15;
const RADIUS = 2000;

interface CarouselWheelProps {
  smoothIndex: any;
}

export const CarouselWheel: React.FC<CarouselWheelProps> = ({
  smoothIndex,
}) => {
  const rotate = useTransform(smoothIndex, (v: number) => -v * ANGLE_STEP);

  return (
    <motion.div
      style={{
        rotate,
        y: RADIUS + 56,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.4,
      }}
    >
      <svg
        width="4400"
        height="4400"
        viewBox="0 0 4400 4400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color: '#9ca3af' }}
      >
        {/* Decorative ticks */}
        {Array.from({ length: 480 }).map((_, i) => {
          const angle = i * 0.75 * (Math.PI / 180);
          const len = 28;
          const r1 = RADIUS - len / 2;
          const r2 = RADIUS + len / 2;

          const x1 = 2200 + r1 * Math.sin(angle);
          const y1 = 2200 - r1 * Math.cos(angle);
          const x2 = 2200 + r2 * Math.sin(angle);
          const y2 = 2200 - r2 * Math.cos(angle);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </motion.div>
  );
};
