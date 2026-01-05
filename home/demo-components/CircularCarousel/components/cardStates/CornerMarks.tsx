import React from 'react';

// Corner Plus Marks - Common decorative element for all card states
export const CornerMarks: React.FC = () => {
  return (
    <>
      {/* Top Left */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'translate(-50%, -50%)',
          width: '12px',
          height: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0, 0, 0, 0.9)',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
            fill="#1C0064"
            fillOpacity="0.901961"
          />
        </svg>
      </div>
      {/* Top Right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translate(50%, -50%)',
          width: '12px',
          height: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0, 0, 0, 0.9)',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
            fill="#1C0064"
            fillOpacity="0.901961"
          />
        </svg>
      </div>
      {/* Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          transform: 'translate(-50%, 50%)',
          width: '12px',
          height: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0, 0, 0, 0.9)',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
            fill="#1C0064"
            fillOpacity="0.901961"
          />
        </svg>
      </div>
      {/* Bottom Right */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          transform: 'translate(50%, 50%)',
          width: '12px',
          height: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0, 0, 0, 0.9)',
          pointerEvents: 'none',
          zIndex: 30,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M8 6H14V8H8V14H6V8H0V6H6V0H8V6Z"
            fill="#1C0064"
            fillOpacity="0.901961"
          />
        </svg>
      </div>
    </>
  );
};
