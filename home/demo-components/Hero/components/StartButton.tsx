import StartStar from '../../../icons/startStar.svg';
import { styled } from 'styled-components';
import React from 'react';

// --- 核心样式组件 ---

const ExpansionCircle = styled.div`
  position: absolute;
  /* 精确定位到左侧图标的中心: padding(12px) + icon宽度的一半(12px) */
  left: 24px;
  top: 50%;
  width: 1px;
  height: 1px;
  background-color: #ffffff;
  border-radius: 50%;
  opacity: 0;
  z-index: 1; /* 在背景之上，但在内容之下 */
  transform: translate(-50%, -50%) scale(1);
  transition:
    transform 600ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 300ms;
  pointer-events: none;
`;

const ContentDefault = styled.div`
  position: relative;
  z-index: 2; /* 默认内容在扩张圆上面，直到它滑出 */
  display: flex;
  align-items: center;
  gap: 0;
  transition: all 400ms ease;
`;

const HoverContent = styled.div`
  position: absolute;
  /* 铺满整个按钮容器 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #000000; /* 变白后的文字颜色 */
  z-index: 5; /* 确保在最顶层 */
  opacity: 0;
  transform: translateX(-20px);
  transition: all 400ms ease;
  pointer-events: none;
`;

const StyledButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 12px;
  background: #16181e;
  border-radius: 200px;
  border: 1px solid rgba(0, 16, 32, 0.06);
  cursor: default;
  overflow: hidden;
  outline: none;
  transition:
    background-color 0.2s,
    transform 200ms;

  &:hover {
    background: #1f2128;
    cursor: pointer;

    ${ExpansionCircle} {
      opacity: 1;
      transform: translate(-50%, -50%) scale(500); /* 覆盖整个按钮 */
    }

    ${ContentDefault} {
      opacity: 0;
      transform: translateX(30px);
    }

    ${HoverContent} {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &:active {
    transform: scale(0.96);
  }
`;

const StartButtonComponent = ({
  text = 'Explore Now',
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleClick = () => {
    if (isHovered) {
      onClick();
    }
  };

  return (
    <StyledButton
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. 扩张圆：初始隐藏，不占位，z-index 为 1 */}
      <ExpansionCircle />

      {/* 2. 默认层：包含 SVG 和白字和箭头，z-index 为 2 */}
      <ContentDefault>
        <img
          src={StartStar}
          alt="startStar"
          style={{ width: '24px', height: '23.148px', flexShrink: 0 }}
        />
        <span
          style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: '17px',
            lineHeight: '26px',
            padding: '1px 4px 2px 8px',
            whiteSpace: 'pre',
          }}
        >
          {text}
        </span>
        <div
          style={{
            width: '24px',
            height: '24px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
          }}
        >
          <svg width="10" height="10" fill="none">
            <path
              clipRule="evenodd"
              d="M0.666667 0H7.33333C7.70152 0 8 0.298477 8 0.666667V7.33333C8 7.70152 7.70152 8 7.33333 8C6.96514 8 6.66667 7.70152 6.66667 7.33333V2.27614L1.13828 7.80453C1.01305 7.92976 0.843478 8 0.666667 8C0.298477 8 0 7.70152 0 7.33333C0 7.15652 0.0702377 6.98695 0.195262 6.86193L5.72386 1.33333H0.666667C0.298477 1.33333 0 1.03486 0 0.666667C0 0.298477 0.298477 0 0.666667 0Z"
              fill="white"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </ContentDefault>

      {/* 3. 悬浮层：包含黑字和箭头，z-index 为 5 */}
      <HoverContent>
        <span style={{ fontWeight: 700, fontSize: '16px' }}>{text}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </HoverContent>
    </StyledButton>
  );
};

export default StartButtonComponent;
