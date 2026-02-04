import styled from 'styled-components';

export const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #fff;
  position: relative;
`;

/**
 * 带左右分隔线的容器组件
 * 每个模块单独添加分隔线
 * 使用 fixed 定位确保分隔线始终可见，不受父容器 overflow 影响
 */
export const SectionWithDividers = styled.div`
  position: relative;
  width: 100%;

  /* 左侧垂直分隔线 - 使用 fixed 定位，相对于视口 */
  &::before {
    content: '';
    position: absolute;
    left: 240px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(44, 62, 93, 0.07);
    z-index: 2;
    pointer-events: none;
  }

  /* 右侧垂直分隔线 - 使用 fixed 定位，相对于视口 */
  &::after {
    content: '';
    position: absolute;
    right: 240px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(44, 62, 93, 0.07);
    z-index: 1;
    pointer-events: none;
  }
`;

/**
 * 带左右边框的容器组件
 * 用于 SupportDesign 组件，通过覆盖层的左右 border 形成边界线效果
 */
export const SectionWithBorders = styled.div<{ backgroundColor?: string }>`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 100%;
  background: ${({ backgroundColor }) => backgroundColor};

  /* 覆盖层外层容器：动态匹配 ScrollableContent 的宽度（包含 16px padding） */
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    bottom: 0;
    min-width: 1056px;
    max-width: 1440px;
    width: calc(var(--scrollable-content-width, 100%) - 32px);
    border-left: 1px solid rgba(44, 62, 93, 0.07);
    border-right: 1px solid rgba(44, 62, 93, 0.07);
    pointer-events: none;
    z-index: 2;
  }

  // /* 内部容器：最小宽度 1056px，最大宽度 1440px，居中对齐 */
  // > * {
  //   min-width: 1056px;
  //   max-width: 1440px;
  //   width: 100%;
  //   position: relative;
  //   height: 100%;
  //   z-index: 0;
  // }
`;
