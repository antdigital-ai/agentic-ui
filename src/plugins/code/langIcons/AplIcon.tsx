import React from 'react';

interface AplIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const AplIcon: React.FC<AplIconProps> = ({ size = '1em', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
    >
      <title>file_type_apl</title>
      <path
        d="M30,28.275,16,2,2,28.275H14.162V30h3.676V28.275ZM17.838,24.826V13.161l6.215,11.665Zm-9.891,0,6.215-11.665V24.826Z"
        style={{
          fill: '#d2d2d2',
        }}
      />
    </svg>
  );
};

export default AplIcon;
