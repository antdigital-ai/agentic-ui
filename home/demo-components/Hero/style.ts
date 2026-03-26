import { styled } from 'styled-components';

export const HeroWrapper = styled.section`
  padding-top: 96px;
  padding-bottom: 0;
  padding-left: 24px;
  padding-right: 24px;
  text-align: center;
  background: rgb(255, 255, 255);
  position: relative;
  overflow: hidden;
`;

export const ContentContainer = styled.div`
  max-width: 896px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  z-index: 1;
`;

export const Badge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
`;

export const BadgeText = styled.span`
  &:first-child {
    color: #2563eb;
  }
`;

export const TitleContainer = styled.div`
  text-align: center;
`;

export const MainTitle = styled.div`
  color: #14161c;
  font-family: 'PingFang SC';
  font-size: 48px;
  font-style: normal;
  font-weight: 600;
  line-height: 67px; /* 139.583% */
  height: 67px; /* 设置明确高度，匹配 line-height */
  overflow: hidden; /* 裁剪旋转时超出容器的文字 */
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StaggeredText = styled.span`
  display: inline-block;
`;

export const StaggeredChar = styled.span`
  display: inline-block;
`;

export const TitleHighlight = styled.span`
  position: relative;
  display: inline-block;
  z-index: 10;
`;

export const TitleHighlightUnderline = styled.span`
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 100%;
  height: 12px;
  background: rgba(59, 130, 246, 0.5);
  transform: skewX(-6deg);
  transform-origin: left;
  z-index: 0;
`;

export const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
`;

// HeroButtons 样式
export const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

export const StartButton = styled.button`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 12px;
  background: #16181e;
  border-radius: 200px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background: #1f2128;
  }
`;

export const StartButtonIcon = styled.div`
  position: relative;
  width: 24px;
  height: 23.148px;
  flex-shrink: 0;
`;

export const StartButtonText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1px 4px 2px 8px;
  font-family: 'PingFang SC', sans-serif;
  font-size: 17px;
  font-weight: 700;
  line-height: 26px;
  color: white;
  white-space: pre;
`;

export const StartButtonArrow = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  transition: transform 0.3s;

  ${StartButton}:hover & {
  }
`;

export const LeftBackgroundImage = styled.img`
  position: absolute;
  top: 0;
  left: 238px;
  z-index: 0;
  pointer-events: none;
  width: 360px;
  height: 271px;
`;

export const RightBackgroundImage = styled.img`
  position: absolute;
  top: 0;
  right: 238px;
  z-index: 0;
  pointer-events: none;
  width: 360px;
  height: 271px;
`;
