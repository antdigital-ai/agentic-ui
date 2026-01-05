import React from 'react';
import { GradientText, Robot, WelcomeMessage } from '@ant-design/agentic-ui';
import { CardDescription, CardTitle, SmallCard } from '../style';

const WelcomeCard: React.FC = () => {
  return (
    <SmallCard $hasDotPattern={true} hasRightBorder={true}>
      <CardTitle>欢迎语</CardTitle>
      <CardDescription>通过简短友好的欢迎语引入使用场景</CardDescription>
      <div
        style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <Robot status={'default'} size={100} />
        <WelcomeMessage
          title={
            <>
              我是
              <GradientText
                colors={['#1D3052', '#1D3052', '#D3CEFF', '#8D83FF', '#1D3052']}
                animationSpeed={10}
                style={{
                  marginLeft: '4px',
                }}
              >
                Agentic UI
              </GradientText>
            </>
          }
          classNames={{
            title: 'font-size: 21px !important; font-weight: 600 !important;',
          }}
          description="Agent 一站式设计与搭建解决方案"
        />
      </div>
    </SmallCard>
  );
};

export default WelcomeCard;
