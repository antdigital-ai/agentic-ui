import { SuggestionList } from '@ant-design/agentic-ui';
import { ReloadOutlined } from '@ant-design/icons';
import React from 'react';
import { useSiteI18n } from '../../../i18n';
import { CardDescription, CardTitle, SmallCard } from '../style';

const SuggestionCard: React.FC = () => {
  const { messages } = useSiteI18n();

  const questionsItems = messages.support.suggestion.items.map(
    (text, index) => ({
      key: `suggestion-${index}`,
      icon: ['💸', '📝', '📊'][index % 3],
      text,
    }),
  );
  return (
    <SmallCard>
      <CardTitle>{messages.support.suggestion.title}</CardTitle>
      <CardDescription>
        {messages.support.suggestion.description}
      </CardDescription>
      <div style={{ marginTop: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: '#999',
            fontSize: '14px',
            marginBottom: '16px',
            cursor: 'pointer',
          }}
        >
          {messages.support.suggestion.exploreMore}{' '}
          <ReloadOutlined
            style={{ fontSize: '14px', width: '12px', height: '12px' }}
          />
        </div>
        <SuggestionList items={questionsItems} type="white" />
      </div>
    </SmallCard>
  );
};

export default SuggestionCard;
