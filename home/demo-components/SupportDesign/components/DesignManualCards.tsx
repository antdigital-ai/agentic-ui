import React from 'react';
import { ONE_TOKEN_URL } from '../../../constants/links';
import { useSiteI18n } from '../../../i18n';
import LinkIcon from '../../../icons/link.svg';
import {
  CardContainer,
  CardContent,
  CardDivider,
  CardIcon,
  CardIconWrapper,
  ManualCardDescription,
  ManualCardExpandIcon,
  ManualCardTitle,
  ManualCardsWrapper,
} from '../style';

const DesignManualCards: React.FC = () => {
  const { messages } = useSiteI18n();

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        minWidth: '1088px',
        maxWidth: '1472px',
        margin: '0 auto',
      }}
    >
      <ManualCardsWrapper>
        <CardDivider />

        {/* 未来设计系统 One-Token */}
        <CardContainer
          onClick={() => {
            window.open(ONE_TOKEN_URL, '_blank', 'noopener,noreferrer');
          }}
          style={{ cursor: 'pointer' }}
        >
          <CardIconWrapper $gradient="green">
            <CardIcon>
              <img
                src="https://mdn.alipayobjects.com/huamei_gmvygo/afts/img/-AkaQ4kZ4mwAAAAAQMAAAAgADsGYAQFr/original"
                style={{ width: '48px', height: '48px' }}
              />
            </CardIcon>
          </CardIconWrapper>
          <CardContent>
            <ManualCardTitle>
              {messages.support.manualCards.oneTokenTitle}
            </ManualCardTitle>
            <ManualCardDescription>
              {messages.support.manualCards.oneTokenDesc}
            </ManualCardDescription>
          </CardContent>
          <ManualCardExpandIcon>
            <img
              src={LinkIcon}
              alt=""
              style={{ width: '8px', height: '8px' }}
            />
          </ManualCardExpandIcon>
        </CardContainer>
      </ManualCardsWrapper>
    </div>
  );
};

export default DesignManualCards;
