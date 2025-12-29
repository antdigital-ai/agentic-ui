import React from 'react';

interface FsharpIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const FsharpIcon: React.FC<FsharpIconProps> = ({
  size = 24,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      {...props}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m236.249 36.066-213.94 213.94 213.94 213.94v-84.36l-129.7-129.7 129.7-129.7z"
        fill="#378bba"
      />
      <path d="m236.249 156.017-93.622 93.62 93.622 93.622z" fill="#378bba" />
      <path
        d="m263.759 36.047 213.94 213.94-213.94 213.94v-84.36l129.7-129.7-129.7-129.7z"
        fill="#30b9db"
      />
    </svg>
  );
};

export default FsharpIcon;
