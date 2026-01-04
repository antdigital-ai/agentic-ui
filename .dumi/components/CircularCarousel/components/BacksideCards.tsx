import StartStar from '../../../icons/startStar.svg';
import React from 'react';

// Common Card Header Component
interface CardHeaderProps {
  title: string;
}

function CardHeader({ title }: CardHeaderProps) {
  return (
    <div
      style={{
        background: '#14161c',
        display: 'flex',
        gap: '4px',
        height: '32px',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 12px 8px',
        borderRadius: '16px 12px 0 0',
      }}
    >
      <img src={StartStar} alt="startStar" />
      <div
        style={{
          fontSize: '13px',
          fontFamily: 'PingFang SC',
          fontWeight: 500,
          color: 'white',
          whiteSpace: 'pre',
          lineHeight: '22px',
          padding: '0 4px',
        }}
      >
        {title}
      </div>
    </div>
  );
}

// Generic Backside Card Component
export interface BacksideCardProps {
  title: string;
  src: string;
  height?: string;
}

export function BacksideCard({
  title,
  src,
  height = '174px',
}: BacksideCardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '320px',
      }}
    >
      <CardHeader title={title} />
      <div
        style={{
          height,
          pointerEvents: 'none',
          position: 'relative',
          borderRadius: '0 12px 12px 12px',
          width: '320px',
          backgroundColor: 'white',
        }}
      >
        <img
          alt=""
          src={src}
          style={{
            position: 'absolute',
            inset: 0,
            maxWidth: 'none',
            objectFit: 'cover',
            borderRadius: '0 12px 12px 12px',
            width: '100%',
            height: '100%',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            border: '2px solid #14161c',
            inset: 0,
            borderRadius: '0 12px 12px 12px',
          }}
        />
      </div>
    </div>
  );
}
