import TitleIcon from '../../icons/titleIcon.svg';
import React from 'react';
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
          <BadgeText>蚂蚁数科一站式企业 Agent 应用设计资源库</BadgeText>
        </Badge>

        <TitleContainer>
          <MainTitle>
            {/* <AnimatePresence mode="popLayout">
              <motion.span
                key={index}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                style={{
                  display: 'inline-flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  perspective: '800px',
                  letterSpacing: '-0.06em',
                }}
              >
                {text.split('').map((char, charIdx) => (
                  <StaggeredChar
                    key={charIdx}
                    as={motion.span}
                    style={{
                      position: 'relative',
                      display: 'block',
                      overflow: 'hidden',
                      paddingBottom: '0.12em',
                      marginBottom: '-0.12em',
                      paddingLeft: '0.02em',
                      paddingRight: '0.02em',
                    }}
                  >
                    <motion.span
                      style={{
                        display: 'inline-block',
                        willChange: 'transform, filter, opacity',
                        whiteSpace: 'pre',
                        transformOrigin: 'bottom',
                      }}
                      variants={charVariants}
                    >
                      {char}
                    </motion.span>
                  </StaggeredChar>
                ))}
              </motion.span>
            </AnimatePresence> */}
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
