import React from 'react';
import {
  AGENT_EVALUATION_URL,
  START_USING_URL,
} from '../../../constants/links';
import { ButtonsContainer } from '../style';
import EvaluationButtonComponent from './EvaluationButton';
import StartButtonComponent from './StartButton';

const HeroButtons: React.FC = () => {
  return (
    <ButtonsContainer>
      {/* 开始使用按钮 */}
      <StartButtonComponent
        text="开始使用"
        onClick={() => {
          window.open(START_USING_URL);
        }}
      />

      {/* Agent 体验评估按钮 */}
      <EvaluationButtonComponent
        text="Agent 体验评估"
        onClick={() => {
          window.open(AGENT_EVALUATION_URL);
        }}
      />
    </ButtonsContainer>
  );
};

export default HeroButtons;
