import { styled } from 'styled-components';

export const SectionWrapper = styled.section`
  width: 100%;
  padding: 134px 0px;
  background: #f7f8f9;
  position: relative;
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

export const VerticalDivider = styled.div`
  width: 1px;
  height: 86px;
  background: rgba(44, 62, 93, 0.07);
  flex-shrink: 0;
  margin-top: 12px;
`;

export const HorizontalDivider = styled.div`
  position: relative;
  height: 1px;
  background: rgba(44, 62, 93, 0.07);
  /* 使用负 margin 让分割线超出 Container 的宽度，延伸到 SectionWrapper 的 padding 区域 */
  width: calc(100% + 480px); /* Container 宽度 + 左右各 240px */
  margin-left: -240px; /* 向左扩展 240px */
  margin-right: -240px; /* 向右扩展 240px */
  z-index: 1;
`;

export const Container = styled.div`
  width: 100%;
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export const SectionTitle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  align-self: stretch;
  color: #14161c;
  font-family: 'PingFang SC';
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

export const SectionSubtitle = styled.div`
  font-size: 24px;
  color: #666;
  line-height: 36px;
  text-align: center;
`;

export const ScrollableWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  background: #f7f8f9;
  position: relative;
  display: flex;
  justify-content: center;
`;

export const ScrollableInner = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  width: 100%;
  max-width: 1472px; /* 1440px + 32px (16px * 2) */

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

export const ScrollableContent = styled.div`
  display: flex;
  justify-content: center;
  padding: 0 16px;
  min-width: 1088px; /* 1056px + 32px (16px * 2) */
  max-width: 1472px; /* 1440px + 32px (16px * 2) */
  width: 100%;
`;

export const DesignGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: auto;
  gap: 1px;

  /* 使用更淡的边框颜色，避免与页面级分隔线重叠时显得过深 */
  border-left: 1px solid rgba(44, 62, 93, 0.01);
  border-right: 1px solid rgba(44, 62, 93, 0.01);
  position: relative;
  align-items: start;
  min-width: 1056px;
  max-width: 1440px;
  width: 100%;
`;

export const TopLeftContainer = styled.div`
  display: flex;
  gap: 1px;
  background: #fff;
  align-self: start;
  height: 100%;
`;

export const DesignCard = styled.div`
  background: #fff;
  padding: 40px;
  transition: all 0.3s;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-self: start;
  height: 100%;
  position: relative;
  z-index: 1;
`;

export const SmallCard = styled(DesignCard)<{
  $hasDotPattern?: boolean;
  hasRightBorder?: boolean;
}>`
  min-height: 0;
  flex: 1;
  padding: 40px;
  background: rgba(255, 255, 255, 0.85);
  position: relative;
  overflow: hidden;
  border-right: ${(props) =>
    props.hasRightBorder ? '1px solid #f1f2f4' : 'none'};

  ${(props) =>
    props.$hasDotPattern &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle, #d8d8d8 0.5px, transparent 1px);
      background-size: 12px 12px;
      background-position: 0 0;
      pointer-events: none;
      z-index: 0;
    }
  `}
`;

export const CardTitle = styled.div`
  color: #3d3d3d;

  font-family: 'PingFang SC';
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

export const CardDescription = styled.div`
  color: rgba(84, 93, 109, 0.8);

  font-family: 'PingFang SC';
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-top: 8px;
`;

export const LinkButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f0f0f0;
  border-radius: 16px;
  font-size: 14px;
  color: #333;
  margin-top: 24px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #e0e0e0;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ToolbarItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #666;
  }
`;

export const ToolbarDivider = styled.span`
  width: 1px;
  height: 12px;
  background: #d9d9d9;
  margin: 0 4px;
`;

// ChatLayout 内容区域样式覆盖
export const DialogFlowWrapper = styled.div`
  .ant-chat-layout-content-scrollable {
    padding-bottom: 0 !important;
  }
`;

// 设计手册卡片样式
export const ManualCardsWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 0;
  border-bottom: 1px solid rgba(44, 62, 93, 0.07);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 20px;
  }
`;

export const CardDivider = styled.div`
  width: 1px;
  background: rgba(44, 62, 93, 0.07);
  align-self: stretch;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    align-self: auto;
  }
`;

export const CardContainer = styled.div`
  flex: 1 1 50%; /* 各占一半，允许缩小和放大 */
  min-width: 0; /* 允许 flex 子元素缩小到内容以下 */
  background: #fff;
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  position: relative;
`;

export const CardIconWrapper = styled.div<{ $gradient?: 'purple' | 'green' }>`
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;

  ${(props) => {
    if (props.$gradient === 'purple') {
      return `
        background: linear-gradient(135deg, #F5F2FF 0%, #E8E0FF 100%);
      `;
    } else if (props.$gradient === 'green') {
      return `
        background: linear-gradient(135deg, #E0F7F2 0%, #C8F0E5 100%);
      `;
    }
    return `background: #f5f5f5;`;
  }}
`;

export const CardIcon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ManualCardTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #000;
  line-height: 26px;
`;

export const ManualCardDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 20px;
`;

export const ManualCardExpandIcon = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s;

  &:hover {
    background-color: rgba(0, 28, 57, 0.06);
    border-radius: 4px;
  }
`;

// Workspace 组件样式覆盖 - 去掉 border 和设置 border-radius
export const WorkspaceWrapper = styled.div`
  .ant-workspace,
  .workspace-no-border.ant-workspace {
    border: none !important;
  }

  .ant-segmented {
    border-radius: 8px !important;
  }

  .ant-segmented-item {
    border-radius: 8px !important;
  }
`;
