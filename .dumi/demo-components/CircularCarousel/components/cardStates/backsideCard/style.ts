import { styled } from 'styled-components';

export const CardBack = styled.div<{ $borderColor?: string }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  border: 1px solid
    ${(props) =>
      props.$borderColor
        ? `rgba(${props.$borderColor}, 0.15)`
        : 'rgba(21, 0, 255, 0.15)'};
  pointer-events: auto;
  z-index: 1;
`;
