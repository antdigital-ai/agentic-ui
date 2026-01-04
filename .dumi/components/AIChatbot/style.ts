import { keyframes, styled } from 'styled-components';

export const SectionWrapper = styled.section`
  width: 100%;
  padding: 38px 40px;
  background: #fff;
`;

export const Container = styled.div`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
`;

export const SectionTitle = styled.span`
  font-family: 'PingFang SC';
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  background: linear-gradient(90deg, #8077df 0%, #211aad 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const SectionSubtitle = styled.div`
  font-size: 16px;
  color: #666;
  line-height: 24px;
`;

export const ExpandIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: rgba(84, 93, 109, 0.8);

  font-family: 'PingFang SC';
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  cursor: pointer;
  &:hover {
    cursor: pointer;
    background-color: rgba(0, 28, 57, 0.06);
  }
`;

export const CentralAvatar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

// Part1 (Robot Top) 浮动动画 - 向上浮动40px
const robotTopFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
`;

export const RobotTopContainer = styled.div`
  animation: ${robotTopFloat} 3s ease-in-out infinite;
`;

export const RobotBottomContainer = styled.div`
  /* 不需要动画，保持静态 */
`;

export const CategoryContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: clamp(4px, 1.2vw, 12px);
  padding: 10px 20px;
  width: 100%;
  box-sizing: border-box;
  /* 支持左右滑动，而不是隐藏内容 */
  overflow-x: auto;
  overflow-y: hidden;
  /* 平滑滚动 */
  scroll-behavior: smooth;
  /* 触摸设备平滑滚动 */
  -webkit-overflow-scrolling: touch;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: thin;

  /* 大屏幕时居中，小屏幕时左对齐以便滚动 */
  justify-content: center;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }

  /* 自定义滚动条样式（Webkit浏览器） */
  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

export const CategoryLabel = styled.div`
  color: #343a45;
  font-family: 'PingFang SC';
  font-style: normal;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
  text-align: center;
  white-space: nowrap;

  /* 使用 clamp 实现自适应，减小2个字号 */
  /* 原来: clamp(10px, 1vw, 13px) -> 现在: clamp(8px, 1vw, 11px) */
  /* 但为了让字体能真正随屏幕变化，提高最大值让 1vw 能生效 */
  /* 在不同屏幕尺寸下，1vw 的值会不同，这样就能真正自适应 */
  font-size: clamp(8px, 1vw, 15px);

  /* 使用媒体查询在不同屏幕尺寸下控制字体大小范围 */
  /* 小屏幕：较小字体 */
  @media (max-width: 768px) {
    font-size: clamp(6px, 1.2vw, 9px);
  }

  /* 中等屏幕：中等字体 */
  @media (min-width: 769px) and (max-width: 1440px) {
    font-size: clamp(6px, 1vw, 9px);
  }

  /* 大屏幕：允许稍微增大 */
  @media (min-width: 1441px) {
    font-size: clamp(10px, 0.9vw, 13px);
  }
`;

export const CategoryLabelEn = styled.div`
  color: #999;
  text-align: center;
  white-space: nowrap;

  /* 原来: clamp(8px, 0.8vw, 12px) -> 现在: clamp(6px, 0.8vw, 10px) */
  /* 提高最大值让字体能真正自适应 */
  font-size: clamp(6px, 0.8vw, 13px);

  @media (max-width: 768px) {
    font-size: clamp(6px, 1vw, 8px);
  }

  @media (min-width: 769px) and (max-width: 1440px) {
    font-size: clamp(5px, 0.8vw, 8px);
  }

  @media (min-width: 1441px) {
    font-size: clamp(8px, 0.7vw, 13px);
  }
`;

export const AvatarCard = styled.div<{ $selected?: boolean }>`
  flex: 0 1 80px; /* 基础宽度80px，允许缩小，不允许放大超过基础值 */
  max-width: 80px;
  min-width: 40px; /* 设置最小缩放限制 */
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  // background: rgba(0, 28, 57, 0.03);
  box-sizing: border-box;
  border: 3px solid rgba(0, 28, 57, 0.03); /* 默认透明边框，避免 hover 时宽度抖动 */
  background-image: none; /* 默认无背景图片 */

  ${(props) =>
    props.$selected
      ? `
  background: rgba(0, 28, 57, 0.03);
    background-image:
      linear-gradient(#fff, #fff),
      /* 内部背景：纯黑 */
        linear-gradient(135deg, rgba(255, 255, 255, 0), rgba(95, 255, 199, 1)),
      /* 渐变2: 绿/透 */
        linear-gradient(
          135deg,
          rgba(9, 177, 255, 1),
          rgba(155, 160, 255, 1),
          rgba(215, 185, 255, 1)
        ); /* 渐变1: 蓝/紫 */

    background-origin: border-box;
    background-clip: padding-box, border-box, border-box;
  `
      : ''}

  &:hover {
    border: 3px solid transparent;
    background: rgba(0, 28, 57, 0.03);
    background-image:
      linear-gradient(#fff, #fff),
      /* 内部背景：纯黑 */
        linear-gradient(135deg, rgba(255, 255, 255, 0), rgba(95, 255, 199, 1)),
      /* 渐变2: 绿/透 */
        linear-gradient(
          135deg,
          rgba(9, 177, 255, 1),
          rgba(155, 160, 255, 1),
          rgba(215, 185, 255, 1)
        ); /* 渐变1: 蓝/紫 */

    background-origin: border-box;
    background-clip: padding-box, border-box, border-box;
  }
`;

export const AvatarCardContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 标签卡片组件，不包含 hover 效果
export const LabelCard = styled.div`
  flex: 0 1 80px;
  max-width: 80px;
  min-width: 40px;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  // background: rgba(0, 28, 57, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  /* 不包含 hover 效果和 cursor pointer */
`;
