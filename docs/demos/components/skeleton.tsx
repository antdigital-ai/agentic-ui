import React from 'react';

function Skeleton({
  width = '100%',
  height = 16,
  radius = 8,
}: Pick<React.CSSProperties, 'width' | 'height'> & {
  radius?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        background:
          'linear-gradient(90deg, rgba(0, 16, 64, 0.06) 0%, rgba(0, 16, 64, 0.04) 100%)',
        borderRadius: radius,
      }}
    />
  );
}

export default Skeleton;
