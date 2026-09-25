import React from 'react';
import { useSiteI18n } from '../../i18n';
import TitleIcon from '../../icons/titleIcon.svg';
import HeroButtons from './components/HeroButtons';
import { RollingText } from './components/RollingText';
import LeftBG from './icons/leftBG.svg';
import RightBG from './icons/rightBG.svg';
import {
  Badge,
  BadgeText,
  ButtonGroup,
  ContentContainer,
  HeroWrapper,
  LeftBackgroundImage,
  MainTitle,
  RightBackgroundImage,
  TitleContainer,
} from './style';

const Hero: React.FC = () => {
  const { messages } = useSiteI18n();

  return (
    <HeroWrapper>
      <LeftBackgroundImage src={LeftBG} alt="" aria-hidden="true" />
      <RightBackgroundImage src={RightBG} alt="" aria-hidden="true" />
      <ContentContainer>
        <Badge>
          <img src={TitleIcon} alt="" />
          <BadgeText>{messages.hero.badge}</BadgeText>
        </Badge>

        <TitleContainer>
          <MainTitle>
            <RollingText text={messages.hero.title}></RollingText>
          </MainTitle>
        </TitleContainer>

        <ButtonGroup>
          <HeroButtons />
        </ButtonGroup>
      </ContentContainer>
    </HeroWrapper>
  );
};

export default Hero;
