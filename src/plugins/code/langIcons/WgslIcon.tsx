import React from 'react';

interface WgslIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const WgslIcon: React.FC<WgslIconProps> = ({
  size = '1em',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      viewBox="0 0 768 600"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>
          {`.cls-1 { fill: #005a9c; } .cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6 { fillRule: evenodd; } .cls-2 { fill: #0066b0; } .cls-3 { fill: #0076cc; } .cls-4 { fill: #0086e8; } .cls-5 { fill: #0093ff; }`}
        </style>
      </defs>
      <path
        id="Triangle_1"
        data-name="Triangle 1"
        className="cls-1"
        d="M 293.6275,508.5 52.8725,91.5 h 481.51 z"
      />
      <path
        id="Triangle_2"
        data-name="Triangle 2"
        className="cls-2"
        d="m 534.6275,91.5 -120.5,208 h 241 z"
      />
      <path
        id="Triangle_3"
        data-name="Triangle 3"
        className="cls-3"
        d="m 534.6275,507.5 -120.5,-208 h 241 z"
      />
      <path
        id="Triangle_4"
        data-name="Triangle 4"
        className="cls-4"
        d="m 654.6275,300.5 -60.5,-104 h 121 z"
      />
      <path
        id="Triangle_5"
        data-name="Triangle 5"
        className="cls-5"
        d="m 654.6275,92.5 -60.5,104 h 121 z"
      />
    </svg>
  );
};

export default WgslIcon;
