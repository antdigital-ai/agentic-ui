import { styled } from 'styled-components';
import React from 'react';

// --- 核心样式组件 ---

const ExpansionCircle = styled.div`
  position: absolute;
  /* 精确定位到左侧图标的中心: padding(16px) + icon宽度的一半(10px) */
  left: 26px;
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
  gap: 4px;
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
  gap: 4px;
  height: 48px;
  padding: 8px 12px 8px 16px;
  border-radius: 200px;
  border: rgba(0, 16, 32, 0.06);
  cursor: default;
  overflow: hidden;
  outline: none;
  transition:
    opacity 0.2s,
    transform 200ms,
    border-color 0.2s;
  background-image:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 100%
    ),
    linear-gradient(
      153.152deg,
      rgb(0, 0, 0) 11.902%,
      rgb(48, 102, 253) 60.356%,
      rgb(86, 102, 238) 87.4%
    );
  box-shadow: inset 0px 0px 1px 0px rgba(80, 92, 113, 0.36);

  &:hover {
    opacity: 0.9;
    cursor: pointer;
    border: 1px solid #000000;

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

const EvaluationButtonComponent = ({
  text = 'Agent 体验评估',
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

      {/* 2. 默认层：包含 icon、文字和箭头，z-index 为 2 */}
      <ContentDefault>
        <div
          style={{
            position: 'relative',
            width: '20px',
            height: '20px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M17.5 11.6667C17.5 11.2064 17.1269 10.8333 16.6667 10.8333H15.8333V12.5C15.8333 12.9602 15.4602 13.3333 15 13.3333C14.5398 13.3333 14.1667 12.9602 14.1667 12.5V10.8333H12.5V12.5C12.5 12.9602 12.1269 13.3333 11.6667 13.3333C11.2064 13.3333 10.8333 12.9602 10.8333 12.5V10.8333H9.16667V12.5C9.16667 12.9602 8.79357 13.3333 8.33333 13.3333C7.8731 13.3333 7.5 12.9602 7.5 12.5V10.8333H5.83333V12.5C5.83333 12.9602 5.46024 13.3333 5 13.3333C4.53976 13.3333 4.16667 12.9602 4.16667 12.5V10.8333H3.33333C2.8731 10.8333 2.5 11.2064 2.5 11.6667V15C2.5 15.4602 2.8731 15.8333 3.33333 15.8333H16.6667C17.1269 15.8333 17.5 15.4602 17.5 15V11.6667ZM17.5 6.66667V5.83333H2.5V6.66667C2.5 7.1269 2.1269 7.5 1.66667 7.5C1.20643 7.5 0.833333 7.1269 0.833333 6.66667V3.33333C0.833333 2.8731 1.20643 2.5 1.66667 2.5C2.1269 2.5 2.5 2.8731 2.5 3.33333V4.16667H17.5V3.33333C17.5 2.8731 17.8731 2.5 18.3333 2.5C18.7936 2.5 19.1667 2.8731 19.1667 3.33333V6.66667C19.1667 7.1269 18.7936 7.5 18.3333 7.5C17.8731 7.5 17.5 7.1269 17.5 6.66667ZM19.1667 15C19.1667 16.3807 18.0474 17.5 16.6667 17.5H3.33333C1.95262 17.5 0.833333 16.3807 0.833333 15V11.6667C0.833333 10.286 1.95262 9.16667 3.33333 9.16667H16.6667C18.0474 9.16667 19.1667 10.286 19.1667 11.6667V15Z"
              fill="white"
            />
          </svg>
        </div>
        <span
          style={{
            color: '#fff',
            fontFamily: "'PingFang SC', sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            lineHeight: '26px',
            padding: '1px 8px 2px',
            whiteSpace: 'pre',
          }}
        >
          {text}
        </span>
        <div
          style={{
            width: 24,
            height: 24,
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

      {/* 3. 悬浮层：包含文字和箭头，z-index 为 5 */}
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

export default EvaluationButtonComponent;
