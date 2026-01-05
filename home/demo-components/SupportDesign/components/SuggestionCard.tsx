import React from 'react';
import { SuggestionList } from '@ant-design/agentic-ui';
import { ReloadOutlined } from '@ant-design/icons';
import { CardDescription, CardTitle, SmallCard } from '../style';

const SuggestionCard: React.FC = () => {
  const questionsItems = [
    {
      key: 'qwe',
      icon: '💸',
      text: '关税对消费类基金的影响',
    },
    {
      key: 'asd',
      icon: '📝',
      text: '恒生科技指数基金相关新闻',
    },
    {
      key: 'zxc',
      icon: '📊',
      text: '数据分析与可视化',
    },
  ];
  return (
    <SmallCard>
      <CardTitle>追问</CardTitle>
      <CardDescription>
        系统根据当前的对话上下文和用户的潜在意图，主动推荐后续问题。
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
          探索更多{' '}
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
