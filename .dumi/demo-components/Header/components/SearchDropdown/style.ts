import { styled } from 'styled-components';

export const DropdownContainer = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 448px;
  max-height: 400px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 24px;
  box-shadow: 0px 6px 16px -5px rgba(20, 22, 28, 0.12);
  overflow: hidden;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transform: ${(props) =>
    props.$visible ? 'translateY(0)' : 'translateY(-10px)'};
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};
  transition: all 0.2s ease;
  z-index: 1001;

  /* 内阴影 */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    box-shadow: inset 0px 0px 1px 0px rgba(83, 95, 116, 0.28);
    pointer-events: none;
  }
`;

export const ScrollContent = styled.div`
  max-height: 390px;
  overflow-y: auto;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.15);
  }
`;

export const CategorySection = styled.div`
  border-top: 1px solid #f7f8f9;
  padding: 16px 8px 0 8px;

  &:first-child {
    border-top: none;
  }
`;

export const CategoryTitle = styled.div`
  color: var(---, rgba(84, 93, 109, 0.65));
  font-family: Poppins;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px; /* 133.333% */
  letter-spacing: 0.6px;
  text-transform: uppercase;
  padding: 0 12px;
  margin-bottom: 8px;
`;

export const ResultItem = styled.a`
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
  }
`;

export const IconContainer = styled.div<{
  $type: 'component' | 'demo' | 'doc';
}>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${(props) => {
    if (props.$type === 'component') return 'rgba(21, 0, 255, 0.15)';
    if (props.$type === 'demo') return 'rgba(84, 201, 0, 0.35)';
    return 'rgba(0, 188, 236, 0.31)';
  }};
`;

export const ContentContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ResultTitle = styled.div`
  font-family: 'PingFang SC', sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
  color: #343a45;
  white-space: pre-wrap;
`;

export const ResultDescription = styled.div`
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
