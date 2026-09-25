import React from 'react';
import { START_USING_URL } from '../../../constants/links';
import { useSiteI18n } from '../../../i18n';
import { ButtonsContainer } from '../style';
import StartButtonComponent from './StartButton';

const HeroButtons: React.FC = () => {
  const { messages } = useSiteI18n();

  return (
    <ButtonsContainer>
      <StartButtonComponent
        text={messages.hero.startButton}
        onClick={() => {
          window.open(START_USING_URL);
        }}
      />
    </ButtonsContainer>
  );
};

export default HeroButtons;
