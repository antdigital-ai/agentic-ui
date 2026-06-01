import * as React from 'react';

export function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width="1rem"
      height="1rem"
      role="img"
      aria-label="PlayIcon"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        d="M3.3333,14.0000L3.3333,2.0000C3.3333,1.6318,3.6318,1.3333,4.0000,1.3333C4.1278,1.3333,4.2530,1.3701,4.3605,1.4392L13.6938,7.4392C14.0035,7.6383,14.0932,8.0508,13.8941,8.3605C13.8424,8.4408,13.7741,8.5091,13.6938,8.5608L4.3605,14.5608C4.0508,14.7599,3.6383,14.6702,3.4392,14.3605C3.3701,14.2529,3.3333,14.1278,3.3333,14.0000Z"
        fillRule="evenodd"
        fill="currentColor"
        fillOpacity="0.8"
      />
    </svg>
  );
}
