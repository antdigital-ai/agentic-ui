import React from 'react';
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
  const text = '让模糊，变精准';

  return (
    <HeroWrapper>
      <LeftBackgroundImage src={LeftBG} alt="Left Background" />
      <RightBackgroundImage src={RightBG} alt="Right Background" />
      <ContentContainer>
        <Badge>
          <img src={TitleIcon} alt="Title Icon" />
          <BadgeText>蚂蚁数科一站式企业 Agent 应用</BadgeText>
        </Badge>

        <TitleContainer>
          <MainTitle>
            <RollingText text={text}></RollingText>
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
