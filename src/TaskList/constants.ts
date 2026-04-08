import React from 'react';

export const LOADING_SIZE = 16;

export const COLLAPSE_VARIANTS = {
  expanded: { height: 'auto', opacity: 1 },
  collapsed: { height: 0, opacity: 0 },
};

export const COLLAPSE_TRANSITION = {
  height: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
  opacity: { duration: 0.2, ease: 'linear' },
};

export const getArrowRotation = (collapsed: boolean): React.CSSProperties => ({
  transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: 'transform 0.3s ease',
});

export const hasTaskContent = (
  content: React.ReactNode | React.ReactNode[],
) => {
  if (Array.isArray(content)) {
    return content.length > 0;
  }
  return !!content;
};
