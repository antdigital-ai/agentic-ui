import React from 'react';
import { ContentLight } from './BacksideCardContent';
import { getGradientSvg } from './utils';

// Main BacksideCard Component
interface BacksideCardProps {
  feature?: any;
  color?: string;
}

export function BacksideCard({ feature, color }: BacksideCardProps) {
  const bgImage = color
    ? getGradientSvg(color)
    : getGradientSvg('40, 118, 255');

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url("${bgImage}")`,
          pointerEvents: 'none',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            border: '1px solid',
            borderColor: color ? `rgba(${color}, 0.15)` : 'rgba(21,0,255,0.15)',
            inset: 0,
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ContentLight feature={feature} />
      </div>
    </div>
  );
}

// Re-export getGradientSvg for backward compatibility
export { getGradientSvg } from './utils';
