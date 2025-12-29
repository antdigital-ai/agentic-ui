import React from 'react';

interface MdxIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const MdxIcon: React.FC<MdxIconProps> = ({ size = '1em', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.25 15.75v-8h2l3 3 3-3h2v8h-2v-5.17l-3 3-3-3v5.17h-2m14-8h3v4h2.5l-4 4.5-4-4.5h2.5z"
        fill="#42a5f5"
        style={{
          fill: '#ffca28',
        }}
      />
    </svg>
  );
};

export default MdxIcon;
