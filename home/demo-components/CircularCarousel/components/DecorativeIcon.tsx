import designStrategyIcon from '../../../assets/design-strategy-icon.png';
import React from 'react';

// SVG paths for decorative icons
const svgPaths = {
  p3c9ff900:
    'M7.49766 0C6.80594 0 6.24519 0.560958 6.24519 1.25294C6.24519 1.93092 6.11458 2.57883 5.85335 3.19667C5.60077 3.79406 5.24394 4.32338 4.78286 4.78464C4.32178 5.24589 3.79265 5.60285 3.19548 5.85553C2.57787 6.11685 1.9302 6.24751 1.25247 6.24751C0.56075 6.24751 5.96046e-08 6.80847 5.96046e-08 7.50045C5.96046e-08 7.83275 0.131956 8.15144 0.36684 8.38641C0.601724 8.62138 0.920295 8.75339 1.25247 8.75339H1.25372C2.26964 8.75322 3.24217 8.55658 4.17128 8.16345C5.06844 7.78384 5.86272 7.24821 6.55412 6.55655C7.24552 5.8649 7.78095 5.07033 8.16041 4.17283C8.55356 3.24299 8.75013 2.26969 8.75013 1.25294C8.75013 0.560958 8.18938 0 7.49766 0Z',
  p13d54100:
    'M7.49766 0C6.80594 0 6.24519 0.560958 6.24519 1.25294C6.24519 1.93092 6.11458 2.57883 5.85336 3.19667C5.60077 3.79406 5.24394 4.32338 4.78286 4.78464C4.32178 5.24589 3.79265 5.60285 3.19548 5.85553C2.57787 6.11685 1.9302 6.24751 1.25247 6.24751C0.560749 6.24751 0 6.80847 0 7.50045C0 7.83275 0.131956 8.15144 0.36684 8.38641C0.601724 8.62138 0.920295 8.75339 1.25247 8.75339H1.25372C2.26964 8.75322 3.24217 8.55658 4.17128 8.16345C5.06844 7.78384 5.86272 7.24821 6.55412 6.55655C7.24552 5.8649 7.78095 5.07033 8.16041 4.17283C8.55356 3.24299 8.75013 2.26969 8.75013 1.25294C8.75013 0.560958 8.18938 0 7.49766 0Z',
  p3ac1b2c0:
    'M7.49766 0C6.80594 0 6.24519 0.560959 6.24519 1.25294C6.24519 1.93092 6.11458 2.57883 5.85335 3.19667C5.60077 3.79406 5.24394 4.32338 4.78286 4.78464C4.32178 5.24589 3.79265 5.60286 3.19548 5.85553C2.57787 6.11686 1.9302 6.24752 1.25247 6.24752C0.56075 6.24752 5.96046e-08 6.80847 5.96046e-08 7.50045C5.96046e-08 7.83275 0.131956 8.15144 0.36684 8.38641C0.601724 8.62138 0.920295 8.75339 1.25247 8.75339H1.25372C2.26964 8.75323 3.24217 8.55658 4.17128 8.16345C5.06844 7.78384 5.86272 7.24821 6.55412 6.55656C7.24552 5.8649 7.78095 5.07033 8.16041 4.17283C8.55356 3.24299 8.75013 2.26969 8.75013 1.25294C8.75013 0.560959 8.18938 0 7.49766 0Z',
  p10a94d00:
    'M7.49766 0C6.80594 0 6.24519 0.560959 6.24519 1.25294C6.24519 1.93092 6.11458 2.57883 5.85336 3.19667C5.60077 3.79406 5.24394 4.32338 4.78286 4.78464C4.32178 5.24589 3.79265 5.60286 3.19548 5.85553C2.57787 6.11686 1.9302 6.24752 1.25247 6.24752C0.560749 6.24752 0 6.80847 0 7.50045C0 7.83275 0.131956 8.15144 0.36684 8.38641C0.601724 8.62138 0.920295 8.75339 1.25247 8.75339H1.25372C2.26964 8.75323 3.24217 8.55658 4.17128 8.16345C5.06844 7.78384 5.86272 7.24821 6.55412 6.55656C7.24552 5.8649 7.78095 5.07033 8.16041 4.17283C8.55356 3.24299 8.75013 2.26969 8.75013 1.25294C8.75013 0.560959 8.18938 0 7.49766 0Z',
};

// Decorative Icon Group (4 colored circles)
function DecorativeIconGroup() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: '8.33% 8.34% 8.33% 8.35%',
      }}
    >
      {/* Top Left - Green */}
      <div
        style={{
          position: 'absolute',
          inset: '8.33% 43.04% 43.04% 8.35%',
        }}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path
            clipRule="evenodd"
            d={svgPaths.p3c9ff900}
            fill="url(#paint0_linear_green)"
            fillRule="evenodd"
          />
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear_green"
              x1="-1.55534"
              x2="7.56808"
              y1="8.75339"
              y2="-0.70928"
            >
              <stop offset="0.271429" stopColor="#36FF23" />
              <stop offset="0.621429" stopColor="#B3D9FF" />
              <stop offset="1" stopColor="#09D6FF" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Right - Purple (rotated 180deg, flipped) */}
      <div
        style={{
          position: 'absolute',
          inset: '8.33% 8.35% 43.04% 43.04%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '8.75px',
            height: '8.753px',
            transform: 'rotate(180deg) scaleY(-1)',
          }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              clipRule="evenodd"
              d={svgPaths.p13d54100}
              fill="url(#paint0_linear_purple)"
              fillRule="evenodd"
            />
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_purple"
                x1="-1.55534"
                x2="7.56808"
                y1="8.75339"
                y2="-0.70928"
              >
                <stop offset="0.271429" stopColor="#B378FF" />
                <stop offset="0.642857" stopColor="#9FCFFF" />
                <stop offset="1" stopColor="#28D7FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Bottom Left - Light Green (flipped) */}
      <div
        style={{
          position: 'absolute',
          inset: '43.04% 43.04% 8.33% 8.35%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '8.75px',
            height: '8.753px',
            transform: 'scaleY(-1)',
          }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              clipRule="evenodd"
              d={svgPaths.p3ac1b2c0}
              fill="url(#paint0_linear_light_green)"
              fillRule="evenodd"
            />
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_light_green"
                x1="-1.55534"
                x2="7.56808"
                y1="8.75339"
                y2="-0.70928"
              >
                <stop offset="0.271429" stopColor="#5DF050" />
                <stop offset="0.628571" stopColor="#84C1FF" />
                <stop offset="1" stopColor="#09D6FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Bottom Right - Violet (rotated 180deg) */}
      <div
        style={{
          position: 'absolute',
          inset: '43.04% 8.35% 8.33% 43.04%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '8.75px',
            height: '8.753px',
            transform: 'rotate(180deg)',
          }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path
              clipRule="evenodd"
              d={svgPaths.p10a94d00}
              fill="url(#paint0_linear_violet)"
              fillRule="evenodd"
            />
            <defs>
              <linearGradient
                gradientUnits="userSpaceOnUse"
                id="paint0_linear_violet"
                x1="-1.55534"
                x2="7.56808"
                y1="8.75339"
                y2="-0.70928"
              >
                <stop offset="0.214286" stopColor="#D7B9FF" />
                <stop offset="0.621428" stopColor="#9BA0FF" />
                <stop offset="1" stopColor="#09B1FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

// Decorative Icon SVG Component
export function DecorativeIconSvg() {
  return (
    <div
      style={{
        position: 'relative',
        width: '18px',
        height: '18px',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '0.02%',
          right: '0.02%',
          top: 0,
        }}
      >
        <DecorativeIconGroup />
      </div>
    </div>
  );
}

// Design Strategy Icon Component
export function DesignStrategyIcon() {
  return (
    <div
      style={{
        backgroundRepeat: 'repeat',
        backgroundSize: '38px 11px',
        backgroundPosition: 'top left',
        height: '12px',
        opacity: 0.5,
        flexShrink: 0,
        width: '14px',
        backgroundImage: `url('${designStrategyIcon}')`,
      }}
    />
  );
}
