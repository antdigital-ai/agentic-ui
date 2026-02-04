import React from 'react';

export const ComponentContainer = ({
  paddingInline = 16,
  paddingBlock = 48,
  description,
  children,
  style,
  containerStyle,
}: {
  paddingInline?: number;
  paddingBlock?: number;
  description?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        ...style,
      }}
    >
      <div
        style={{
          width: '100%',
          paddingInline,
          paddingBlock,
          background: 'var(--color-gray-bg-page)',
          borderRadius: 48,
          ...containerStyle,
        }}
      >
        {children}
      </div>
      {description && (
        <div
          style={{
            color: 'var(--color-gray-text-secondary)',
            fontSize: 14,
            fontWeight: 'normal',
            lineHeight: '28px',
            letterSpacing: 'normal',
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
};
