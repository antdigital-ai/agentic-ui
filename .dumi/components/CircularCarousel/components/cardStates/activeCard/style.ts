import { styled } from 'styled-components';

export const CardFront = styled.div<{ $isActive: boolean; $bgImage?: string }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid transparent;
  background: ${(props) => (props.$isActive ? '#1e293b' : 'white')};
  background-image: ${(props) =>
    props.$bgImage && !props.$isActive ? `url('${props.$bgImage}')` : 'none'};
  background-size: 100% 100%;
`;
