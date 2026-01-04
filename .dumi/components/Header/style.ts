import { styled } from 'styled-components';
import { Input } from 'antd';

export const HeaderWrapper = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  border-bottom: 1px solid rgba(44, 62, 93, 0.07);
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
`;

export const LogoContainer = styled.div`
  display: flex;
  gap: 8px;
  height: 32px;
`;

export const Logo = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 4px;
`;

export const LogoText = styled.div`
  display: flex;
  padding-top: 8px;
`;

export const NavMenu = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
  height: 32px;
`;

export const MenuItem = styled.a<{ $active?: boolean; $disabled?: boolean }>`
  font-family: 'PingFang SC';
  font-size: 15px;
  font-style: normal;
  line-height: normal;
  color: ${(props) => {
    if (props.$disabled) return '#999';
    return '#343a45';
  }};
  font-weight: ${(props) => (props.$active ? 500 : 400)};
  text-decoration: none;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s;
  padding: 0 8px;
  border-radius: 6px;
  background: ${(props) =>
    props.$active ? 'rgba(0, 28, 57, 0.06)' : 'transparent'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.$disabled ? 'none' : 'auto')};

  &:hover {
    ${(props) =>
      !props.$disabled &&
      `
      color: #343a45;
      background: rgba(0, 28, 57, 0.06);
    `}
  }
`;

export const MenuItemWithDropdown = styled.a<{
  $active?: boolean;
  $disabled?: boolean;
}>`
  font-family: 'PingFang SC';
  font-size: 15px;
  font-style: normal;
  line-height: normal;
  color: ${(props) => {
    if (props.$disabled) return '#999';
    return '#343a45';
  }};
  font-weight: ${(props) => (props.$active ? 500 : 400)};
  text-decoration: none;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s;
  padding: 0 8px;
  border-radius: 6px;
  background: ${(props) =>
    props.$active ? 'rgba(0, 28, 57, 0.06)' : 'transparent'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 100%;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.$disabled ? 'none' : 'auto')};

  & > span {
    display: inline-flex;
    align-items: center;
    padding: 0 4px;
  }

  & > svg {
    width: 12px;
    height: 12px;
    color: #343a45;
    flex-shrink: 0;
  }

  &:hover {
    ${(props) =>
      !props.$disabled &&
      `
      color: #343a45;
      background: rgba(0, 28, 57, 0.06);
    `}
  }
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  width: 237px;
  height: 32px;
  padding: 0 12px;
  background: linear-gradient(
    to right,
    rgba(0, 16, 64, 0.06),
    rgba(0, 16, 64, 0.04)
  );
  border-radius: 10000px;
  position: relative;
  z-index: 1002;
`;

export const StyledInput = styled(Input)`
  && {
    height: 32px;
    border: none;
    background: transparent;
    box-shadow: none;
    padding: 0 8px;
    font-family: 'PingFang SC';
    font-size: 13px;
    color: rgba(80, 92, 113, 0.47);
    flex: 1;

    &::placeholder {
      color: rgba(80, 92, 113, 0.47);
      font-family: 'PingFang SC';
      font-size: 13px;
    }

    &:focus,
    &:hover {
      border: none;
      box-shadow: none;
    }
  }
`;

export const StyledSearchIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  color: rgba(80, 92, 113, 0.47);

  & > svg {
    width: 10px;
    height: 10px;
  }
`;

export const StyledLinkIcon = styled.div`
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`;

export const AIBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 14px;
  flex-shrink: 0;
  background: rgba(80, 92, 113, 0.1);
  border-radius: 2px;
  font-family: 'PingFang SC';
  font-size: 10px;
  font-weight: 400;
  color: rgba(80, 92, 113, 0.6);
  line-height: 1;
`;

// Dropdown Menu Styles
export const DropdownWrapper = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
`;

export const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(44, 62, 93, 0.07);
  overflow: hidden; /* 禁用所有滚动条 */
  transform-origin: top;
  z-index: 999;
  pointer-events: ${(props) => (props.$isOpen ? 'auto' : 'none')};

  /* 性能优化 */
  will-change: ${(props) => (props.$isOpen ? 'opacity, height' : 'auto')};
  contain: layout style paint;
`;

export const MenuContainer = styled.div`
  width: 100%;
  max-width: 100vw; /* 确保不会超出视口宽度 */
  overflow-x: hidden; /* 防止横向滚动 */
  overflow-y: hidden; /* 禁用垂直滚动条 */
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

export const ScrollableWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
`;

/**
 * 带左右边框的容器组件
 * 用于菜单内容，通过容器的左右 border 形成边界线效果
 */
export const MenuContentWrapper = styled.div`
  min-width: 1056px;
  max-width: 1440px;
  width: 100%;
  height: 100%;
  position: relative;
  border-left: 1px solid rgba(44, 62, 93, 0.07);
  border-right: 1px solid rgba(44, 62, 93, 0.07);
`;

export const ScrollableInner = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  width: 100%;
  height: 100%;

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

export const MenuContent = styled.div`
  min-width: 1088px; /* 1056px + 32px (16px * 2) */
  max-width: 1472px; /* 1440px + 32px (16px * 2) */
  width: 100%;
  display: flex;
  align-items: flex-start;
  padding: 0 16px;
  box-sizing: border-box; /* 确保 padding 包含在宽度内 */
`;

// Navigation Section (Left)
export const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  min-width: 336px;
`;

export const NavSectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'PingFang SC';
  font-size: 13px;
  font-weight: 500;
  color: #343a45;
  margin-bottom: 4px;
`;

export const NavSectionTitleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const NavItem = styled.a`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
`;

export const NavItemTitle = styled.div`
  font-family: 'PingFang SC';
  font-size: 15px;
  font-weight: 600;
  color: #343a45;
  line-height: 1.2;
  ${NavItem}:hover & {
    text-decoration: underline;
    text-underline-position: from-font;
  }
`;

export const NavItemDescription = styled.div`
  font-family: 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  color: rgba(84, 93, 109, 0.65);
  line-height: 20px;
`;

// Design Resources Section (Right)
export const DesignResourcesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 128px 12px 32px;
  flex: 1;
`;

export const DesignResourcesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'PingFang SC';
  font-size: 13px;
  font-weight: 500;
  color: #343a45;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`;

export const DesignResourcesGrid = styled.div`
  display: flex;
  gap: 32px;
  align-items: flex-start;
`;

export const DesignResourceCard = styled.a`
  display: flex;
  flex-direction: column;
  width: 335px;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  will-change: transform;
  transform: translateZ(0); /* GPU 加速 */

  &:hover {
    transform: translateY(-2px) translateZ(0);
  }
`;

export const DesignResourceCardImage = styled.div`
  width: 100%;
  height: 188px;
  border-radius: 8px;
  margin-bottom: 16px;
  position: relative;
  transform: translateZ(0); /* GPU 加速 */
  backface-visibility: hidden;

  /* 优化图片渲染 */
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
`;

export const DesignResourceCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0;
`;

export const DesignResourceCardTitle = styled.div`
  font-family: 'PingFang SC';
  font-size: 15px;
  font-weight: 600;
  color: #343a45;
  line-height: 1.2;

  ${DesignResourceCard}:hover & {
    text-decoration: underline;
    text-underline-position: from-font;
  }
`;

export const DesignResourceCardDescription = styled.div`
  font-family: 'PingFang SC';
  font-size: 12px;
  font-weight: 400;
  color: rgba(84, 93, 109, 0.65);
  line-height: 20px;
  white-space: pre;
`;

export const VerticalDivider = styled.div`
  width: 1px;
  align-self: stretch;
  background: rgba(44, 62, 93, 0.07);
  flex-shrink: 0;
`;

export const RightEdgeDivider = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 240px;
  width: 1px;
  background: rgba(44, 62, 93, 0.07);
  z-index: 10;
`;

export const LeftEdgeDivider = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 240px;
  width: 1px;
  background: rgba(44, 62, 93, 0.07);
  z-index: 10;
`;
