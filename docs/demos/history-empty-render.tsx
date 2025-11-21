import { History, SuggestionList } from '@ant-design/agentic-ui';
import { Button, Flex } from 'antd';
import React, { useState } from 'react';

/**
 * 展示 emptyRender 和 searchOptions.trigger 配置的示例
 */
const HistoryEmptyRenderDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-1');
  const [hasData, setHasData] = useState(false);

  const mockDataRequest = async () => {
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '这是一个有数据的示例',
        agentId: 'demo-agent',
        gmtCreate: Date.now(),
        gmtLastConverse: Date.now(),
      },
    ];
  };

  // 模拟空数据请求
  const mockEmptyRequest = async () => {
    return [];
  };

  const items = [
    { key: '1', text: '💸 关税对消费类基金的影响' },
    {
      key: '2',
      text: '📝 恒生科技指数基金相关新闻',
    },
    {
      key: '3',
      text: '📊 数据分析与可视化',
    },
  ];

  // 自定义空状态渲染
  const renderEmpty = () => {
    return (
      <div style={{ padding: '16px 0px', textAlign: 'center' }}>
        <Flex
          vertical
          align="center"
          style={{
            marginBottom: 12,
          }}
        >
          <img
            style={{ width: 64, height: 64, marginBottom: 8 }}
            alt="empty"
            src="https://mdn.alipayobjects.com/huamei_rdqlck/afts/img/RknpTYULGZUAAAAAQVAAAAgADjlgAQFr/original"
          ></img>
          <div
            style={{
              font: 'var(--font-text-h6-base)',
              letterSpacing: 'var(--letter-spacing-h6-base, normal)',
              color: 'var(--color-gray-text-secondary)',
            }}
          >
            暂无历史对话
          </div>
          <div
            style={{
              font: 'var(--font-text-body-base)',
              letterSpacing: 'var(--letter-spacing-body-base, normal)',
              color: 'var(--color-gray-text-light)',
            }}
          >
            你可以试试问我
          </div>
        </Flex>
        <SuggestionList layout="horizontal" maxItems={4} items={items} />
      </div>
    );
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ marginBottom: 20 }}>
        <h3>History 组件 - emptyRender 空状态渲染</h3>
        <p style={{ color: 'var(--color-gray-text-secondary)' }}>
          当历史记录为空时，显示自定义空状态内容
        </p>
        <Button
          onClick={() => setHasData(!hasData)}
          style={{ marginBottom: 16 }}
        >
          切换数据状态（当前：{hasData ? '有数据' : '空数据'}）
        </Button>
      </div>

      <div
        style={{
          maxWidth: 248,
          padding: 16,
          borderRadius: '16px',
          border: '1px solid var(--color-gray-border-light)',
          backgroundColor: 'var(--color-gray-bg-container)',
        }}
      >
        <History
          agentId="demo-agent"
          sessionId={currentSessionId}
          request={hasData ? mockDataRequest : mockEmptyRequest}
          standalone
          emptyRender={renderEmpty}
          agent={{
            enabled: true,
            onSearch: (keyword) => {
              console.log('搜索关键词:', keyword);
            },
            onNewChat: () => {
              console.log('创建新对话');
            },
            searchOptions: {
              placeholder: '搜索历史记录',
              text: '历史对话',
              trigger: 'enter', // 回车触发搜索
            },
          }}
          onClick={(sessionId, item) => {
            console.log('点击会话:', sessionId, item);
            setCurrentSessionId(sessionId);
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>功能说明：</h4>
        <ul style={{ color: 'var(--color-gray-text-secondary)', fontSize: 14 }}>
          <li>
            <strong>emptyRender</strong>: 当历史记录为空时，显示自定义空状态组件
          </li>
          <li>
            <strong>searchOptions.trigger</strong>: 配置搜索触发方式
            <ul>
              <li>'change' (默认): 输入时实时搜索（防抖 360ms）</li>
              <li>'enter': 按回车键时触发搜索</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HistoryEmptyRenderDemo;
