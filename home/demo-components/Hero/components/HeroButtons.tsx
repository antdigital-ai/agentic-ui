import React from 'react';
import { START_USING_URL } from '../../../constants/links';
import { ButtonsContainer } from '../style';
import StartButtonComponent from './StartButton';

const HeroButtons: React.FC = () => {
  return (
    <ButtonsContainer>
      <StartButtonComponent
        text="开始使用"
        onClick={() => {
          window.open(START_USING_URL);
        }}
      />
    </ButtonsContainer>
  );
};

export default HeroButtons;
