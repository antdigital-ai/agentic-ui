import React from 'react';

interface CheckCircleIconProps {
  size?: number;
  color?: string;
  strokeColor?: string;
}

export const CheckCircleIcon: React.FC<CheckCircleIconProps> = ({
  size = 22,
  color = '#343A45',
  strokeColor = 'white',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flexShrink: 0,
        color: color,
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="currentColor"
        stroke={strokeColor}
        strokeWidth="1"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
