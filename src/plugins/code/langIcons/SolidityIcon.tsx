import React from 'react';

interface SolidityIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const SolidityIcon: React.FC<SolidityIconProps> = ({
  size = 24,
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
      <g fill="#0288d1">
        <path d="m5.747 14.046 6.254 8.61 6.252-8.61-6.254 3.807z" />
        <path d="M11.999 1.343 5.747 11.83l6.252 3.807 6.253-3.807z" />
      </g>
    </svg>
  );
};

export default SolidityIcon;
