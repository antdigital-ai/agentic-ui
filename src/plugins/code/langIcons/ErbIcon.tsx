import React from 'react';

interface ErbIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const ErbIcon: React.FC<ErbIconProps> = ({ size = '1em', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
    >
      <title>file_type_erb</title>
      <path
        d="M7.25,24.75h17.5L12.5,12.5,7.25,17.75ZM2,30H30V2H16L2,16Zm25.375-2.625H4.625v-10.5l12.25-12.25h10.5Z"
        style={{
          fill: '#921a1e',
        }}
      />
    </svg>
  );
};

export default ErbIcon;
