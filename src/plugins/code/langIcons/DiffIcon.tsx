import React from 'react';

interface DiffIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const DiffIcon: React.FC<DiffIconProps> = ({
  size = '1em',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 1.5c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h2v-2h-2v-11h11v2h2v-2c0-1.11-.89-2-2-2h-11m6 6c-1.11 0-2 .89-2 2v2h2v-2h2v-2h-2m4 0v2h1v1h2v-3h-3m5 0v2h2v11h-11v-2h-2v2c0 1.11.89 2 2 2h11c1.11 0 2-.89 2-2v-11c0-1.11-.89-2-2-2h-2m-4 5v2h-2v2h2c1.11 0 2-.89 2-2v-2h-2m-7 1v3h3v-2h-1v-1z"
        style={{
          fill: '#42a5f5',
        }}
      />
    </svg>
  );
};

export default DiffIcon;
