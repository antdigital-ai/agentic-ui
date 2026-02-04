import { styled } from 'styled-components';

export const CarouselContainer = styled.div`
  position: relative;
  min-height: 200vh; /* 给 sticky 足够的滚动空间 */
  background: white;
  // scroll-snap-align: start;
  // scroll-snap-stop: always;
  padding-top: 48px;
`;

export const StickyContainer = styled.div`
  position: sticky;
  top: 48px; /* Header 高度 */
  width: 100%;
  height: calc(100vh - 72px); /* 减去 header 高度 */
  min-height: 800px; /* 确保最小高度，避免内容被压缩 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(249, 250, 251, 0.3);
  /* 确保整个容器在分隔线之上 */
  z-index: 10;
  isolation: isolate;

  /* 当视口高度不够时，使用 flex-start 对齐并添加 padding-top */
  @media (max-height: 900px) {
    justify-content: flex-start;
    padding-top: calc(48px + 32px); /* NavigationMenu top + 间距 */
    align-items: center;
  }

  @media (min-width: 768px) {
    min-height: 1000px; /* 桌面端更大的最小高度 */

    @media (max-height: 1100px) {
      justify-content: flex-start;
      padding-top: calc(48px + 32px);
    }
  }
`;

export const NavigationMenu = styled.div`
  position: absolute;
  top: 48px;
  z-index: 110;
  width: 100%;
  max-width: 1280px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 16px;
  }
`;

export const NavButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
  border: none;
  background: transparent;
  cursor: pointer;

  @media (min-width: 768px) {
    font-size: 17px;
  }

  color: ${(props) =>
    props.$isActive ? '#14161C' : 'rgba(84, 93, 109, 0.65)'};

  &:hover {
    color: ${(props) => (props.$isActive ? '#14161C' : '#343a45')};
  }
`;

export const ActiveIndicatorWrapper = styled.div`
  position: absolute;
  inset: 0;
  margin: -4px;
  border-radius: 8px;
`;

export const CarouselWheelContainer = styled.div`
  position: relative;
  width: 100%;
  /* 固定高度，基于卡片高度 + 一些额外空间 */
  height: 660px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止被压缩 */
  /* 创建新的堆叠上下文，确保卡片在分隔线之上 */
  z-index: 10;
  isolation: isolate;
`;

export const CardMotionContainer = styled.div`
  position: absolute;
  width: 406px;
  height: 660px;
  /* 确保卡片有基础 z-index，动态 z-index 会覆盖这个值 */
  z-index: 10;

  @media (min-width: 768px) {
    width: 406px;
    height: 660px;
  }
`;

export const CardWrapper = styled.div<{ $isActive?: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  cursor: ${(props) => (props.$isActive ? 'pointer' : 'default')};
  perspective: 1000px;

  /* 确保按钮等交互元素可以接收点击事件 */
  button,
  a,
  [role='button'] {
    position: relative;
    z-index: 100;
    pointer-events: auto;
  }
`;

export const CardFlipContainer = styled.div<{ $isActive?: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.7s ease-in-out;
  transform-style: preserve-3d;

  /* 只有在 isActive 时才允许翻转 */
  ${(props) =>
    props.$isActive
      ? `
    /* 当父容器 hover 时翻转 */
    ${CardWrapper}:hover > & {
      transform: rotateY(180deg);
    }
  `
      : ''}
`;

export const BackgroundGradient = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, #f3f4f6, transparent);
  z-index: -10;
  pointer-events: none;
`;

export const WheelContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
  opacity: 0.4;
`;

export const CanvasWrapper = styled.canvas``;
