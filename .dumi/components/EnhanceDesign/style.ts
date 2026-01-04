import { styled } from 'styled-components';

export const SectionWrapper = styled.section`
  width: 100%;
  padding: 0 0 100px;
  position: relative;
`;

export const VerticalDivider = styled.div`
  width: 1px;
  height: 50px;
  background: #e8e8e8;
  flex-shrink: 0;
  margin-top: 12px;
`;

export const TopVectorIcon = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  flex-direction: column;
`;

export const Container = styled.div`
  min-width: 1054px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  position: relative; /* 为分隔线的绝对定位提供参考 */
`;

export const SectionHeader = styled.div`
  text-align: center;
  position: relative;
  z-index: 0;
`;

export const SectionTitle = styled.div`
  color: #343a45;
  font-family: 'PingFang SC';
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin-top: 100px;
`;

export const SectionSubtitle = styled.div`
  font-size: 24px;
  color: #666;
  line-height: 36px;
  text-align: center;
  margin-bottom: 44px;
`;

export const TabsContainer = styled.div`
  margin-bottom: 67px;
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: visible; /* 改为 visible，让向上延伸的线可见 */
  background: #fff;
  position: relative;
  z-index: 1; /* 确保 tab 内容在分隔线之上 */
`;

export const CustomTab = styled.div<{ $active?: boolean }>`
  flex: 1;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  background: ${(props) => (props.$active ? '#343a45' : '#fff')};
  border-right: 1px solid rgba(0, 16, 32, 0.06);
  border-bottom: 1px solid rgba(0, 16, 32, 0.06);
  border-top: 1px solid rgba(0, 16, 32, 0.06);
  position: relative;

  &:last-child {
    border-right: none;
  }

  /* 除了最后一个 tab，其他 tab 右侧添加向上延伸的分隔线 */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: 100%; /* 从 tab 顶部开始 */
    right: -1px; /* 对齐到 border-right 的位置 */
    width: 1px;
    height: 260px; /* 延伸到 SectionHeader 的 margin-bottom 位置 */
    background: rgba(44, 62, 93, 0.07);
    z-index: 0;
    pointer-events: none; /* 不阻挡点击，不占据高度 */
  }

  &:hover {
    background: ${(props) =>
      props.$active ? '#343a45' : 'rgba(44, 62, 93, 0.07)'};
  }
`;

export const TabTitle = styled.div<{ $active?: boolean }>`
  font-family: 'PingFang SC';
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  color: ${(props) => (props.$active ? '#fff' : '#343a45')};
  transition: color 0.3s;
`;

export const TabDescription = styled.div<{ $active?: boolean }>`
  font-family: 'PingFang SC';
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  color: ${(props) => (props.$active ? '#fff' : '#666')};
  transition: color 0.3s;
`;

export const PreviewContainer = styled.div`
  border-radius: 16px 16px 0 0;
  padding: 12px 12px 0 12px;
  margin: 0 67px;
  height: 700px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-radius: 16px 16px 0 0;
  background: rgba(0, 28, 57, 0.03);

  /* 描边/控件-base */
  box-shadow: 0 0 1px 0 var(--shadow-hard-base, rgba(83, 95, 116, 0.28)) inset;

  /* 确保两个区块平分宽度 */
  > * {
    min-width: 0; /* 防止内容溢出 */
  }

  /* Monaco Editor 样式覆盖 */
  .monaco-editor {
    border-radius: 16px 0 0 0;
    width: 100%;
    height: 100%;
  }

  /* 显示 y 方向的滚动条，隐藏 x 方向的滚动条 */
  .monaco-editor .monaco-scrollable-element > .scrollbar.vertical {
    opacity: 0; /* 默认隐藏滚动条 */
    transition: opacity 0.2s ease;
    width: 2px !important; /* 设置滚动条宽度为 2px */
  }

  /* hover 或滚动时显示滚动条 */
  .monaco-editor:hover .monaco-scrollable-element > .scrollbar.vertical,
  .monaco-editor .monaco-scrollable-element.scrolling > .scrollbar.vertical {
    opacity: 1 !important;
  }

  /* 当鼠标在滚动条上时保持显示 */
  .monaco-editor .monaco-scrollable-element > .scrollbar.vertical:hover {
    opacity: 1 !important;
  }

  .monaco-editor .monaco-scrollable-element > .scrollbar.horizontal {
    display: none !important;
  }

  /* 调整滚动条滑块样式 */
  .monaco-editor .monaco-scrollable-element > .scrollbar.vertical .slider {
    width: 2px !important;
    border-radius: 1px;
  }

  /* 调整滚动条轨道样式 */
  .monaco-editor
    .monaco-scrollable-element
    > .scrollbar.vertical
    .scrollbar-shadow {
    width: 2px !important;
  }

  .monaco-editor .overflow-guard {
  }

  .sofa-ui-monaco-container {
    border-radius: 16px 0 0 0;
    border: none;
  }
`;

export const PreviewHeader = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px 12px 12px;
  border-radius: 8px 8px 0 0;
`;

export const TrafficLights = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const TrafficLight = styled.div<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${(props) => props.$color};
`;

export const HeaderText = styled.div`
  font-size: 12px;
  color: #a7aab3;
  font-family: 'PingFang SC', sans-serif;
`;

export const EditorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ContentWrapper = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  box-shadow: 0 2px 6px -1px rgba(10, 48, 104, 0.07);
  height: 100%; /* 确保高度填满父容器 */
  min-height: 0; /* 允许 grid 子元素缩小 */

  /* 确保两个子元素都有固定高度以便滚动 */
  > * {
    height: 100%;
    min-height: 0;
  }
`;

export const ContentCard = styled.div`
  background: #fff;
  border-left: 1px solid rgba(236, 239, 243, 1);
  border-radius: 0 16px 0 0;
  padding: 0; /* 移除所有 padding，让滚动条在最外层 */
  width: 100%;
  min-width: 0; /* 防止内容溢出 */
  overflow-y: auto; /* 添加 y 方向滚动条 */
  overflow-x: hidden;
  height: 100%; /* 确保高度填满容器 */
  box-sizing: border-box;

  /* 自定义滚动条样式 - 滚动条在最右边（紧贴容器边缘） */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

export const ContentCardInner = styled.div`
  padding: 24px; /* 内容区域保持原有的所有 padding */
  height: 100%;
  box-sizing: border-box;
  min-height: min-content; /* 确保内容可以撑开高度 */
`;

export const CardTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000;
`;

export const CardContent = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.8;

  ul {
    margin: 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }
`;

export const HorizontalDivider = styled.div`
  position: relative;
  height: 1px;
  background: rgba(44, 62, 93, 0.07);
  /* 使用负 margin 让分割线超出 Container 的宽度，延伸到 SectionWrapper 的 padding 区域 */
  width: calc(100% + 480px); /* Container 宽度 + 左右各 240px */
  margin-left: -240px; /* 向左扩展 240px */
  margin-right: -240px; /* 向右扩展 240px */
`;
