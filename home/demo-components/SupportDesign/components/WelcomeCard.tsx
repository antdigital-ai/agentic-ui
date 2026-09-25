import { GradientText, Robot, WelcomeMessage } from '@ant-design/agentic-ui';
import React from 'react';
import { useSiteI18n } from '../../../i18n';
import { CardDescription, CardTitle, SmallCard } from '../style';

const WelcomeCard: React.FC = () => {
  const { messages } = useSiteI18n();

  return (
    <SmallCard $hasDotPattern={true} hasRightBorder={true}>
      <CardTitle>{messages.support.welcome.title}</CardTitle>
      <CardDescription>{messages.support.welcome.description}</CardDescription>
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
              {messages.support.welcome.messageTitlePrefix}
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
          description={messages.support.welcome.messageDescription}
        />
      </div>
    </SmallCard>
  );
};

export default WelcomeCard;
