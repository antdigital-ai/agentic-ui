import { styled } from 'styled-components';

export const SectionWrapper = styled.section`
  width: calc(100% - 32px);
  height: 100%;
  background: #121319;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 16px;
  border-radius: 40px;
`;

export const Container = styled.div`
  max-width: 1440px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0 80px;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 24px;
  }
`;

export const DiamondIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0;
  position: relative;

  svg {
    width: 25px;
    height: 24.28px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 56px;
    background: #3066fd;
    margin-top: 10px;
  }
`;

export const ShowroomSubtitle = styled.div`
  text-align: center;
  color: #fff;
  font-family: 'PingFang SC';
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-top: 100px;
  margin-bottom: 12px;
  letter-spacing: 0.3px;
`;

export const ShowroomTitle = styled.div`
  text-align: center;
  margin-bottom: 64px;
  color: #fff;
  font-family: 'PingFang SC';
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
  line-height: 67px; /* 139.583% */
`;

export const ShowroomTitleHighlight = styled.span`
  background: linear-gradient(96deg, #fff 4%, #3066fd 66%, #5666ee 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 12px;
`;

export const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 312px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  /* 确保内容不会超出父容器 */
  contain: layout;
`;

export const CarouselCard = styled.div<{
  $isActive: boolean;
  $isAnimating?: boolean;
}>`
  position: absolute;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  transform-origin: center center;

  @media (max-width: 768px) {
    width: 320px;
    height: 200px;
  }
`;

export const ShowroomCard = styled.div<{ $isActive?: boolean }>`
  width: 500px;
  height: 300px;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.$isActive
      ? '0 24px 64px rgba(0, 0, 0, 0.4)'
      : '0 16px 48px rgba(0, 0, 0, 0.25)'};
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
`;

export const ShowroomCardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  user-select: none;
  pointer-events: none;
`;

export const CornerBracket = styled.div<{
  $position: 'top-left' | 'bottom-right' | 'bottom-left' | 'top-right';
}>`
  position: absolute;
  z-index: 11;
  pointer-events: none;
  /* 固定定位在容器中心，基于激活卡片尺寸 */
  /* 使用统一的定位逻辑确保完全对称 */
  ${(props) => {
    // ShowroomCard 实际尺寸：500px宽，300px高
    // 容器中心位置：50% 50%
    const cardWidth = 500;
    const cardHeight = 300;
    const gap = 24; // 角标与卡片边缘的间隙（像素）

    // 计算卡片四个角的精确位置
    const cardLeft = `calc(50% - ${cardWidth / 2}px)`;
    const cardRight = `calc(50% + ${cardWidth / 2}px)`;
    const cardTop = `calc(50% - ${cardHeight / 2}px)`;
    const cardBottom = `calc(50% + ${cardHeight / 2}px)`;

    if (props.$position === 'top-left') {
      return `
        top: calc(${cardTop} - ${gap}px);
        left: calc(${cardLeft} - ${gap}px);
      `;
    } else if (props.$position === 'top-right') {
      return `
        top: calc(${cardTop} - ${gap}px);
        left: calc(${cardRight} - 26px + ${gap}px);
      `;
    } else if (props.$position === 'bottom-left') {
      return `
        top: calc(${cardBottom} - 26px + ${gap}px);
        left: calc(${cardLeft} - ${gap}px);
      `;
    } else {
      return `
        top: calc(${cardBottom} - 26px + ${gap}px);
        left: calc(${cardRight} - 26px + ${gap}px);
      `;
    }
  }}

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const ComingSoonTitle = styled.div`
  color: #fff;
  font-family: 'PingFang SC';
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: center;
  margin-top: 30px;
`;

export const ComingSoonText = styled.div`
  color: #fff;

  font-family: 'PingFang SC';
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-align: center;
  margin-bottom: 100px;
  margin-top: 10px;
`;
