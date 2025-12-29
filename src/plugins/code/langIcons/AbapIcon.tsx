import React from 'react';

interface AbapIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AbapIcon: React.FC<AbapIconProps> = ({
  size = '1em',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      version="1.1"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m16.851 58.425v83.149h83.149l83.149-83.149h-83.149z"
        fill="#0288d1"
        strokeWidth=".83149"
      />
    </svg>
  );
};

export default AbapIcon;
