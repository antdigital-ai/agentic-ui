import { Bubble, MessageBubbleData } from '@ant-design/agentic-ui';
import React from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';
import { bubbleDemoMarkdownSample } from './sharedDemoContent';

const AfterContentBeforeContentDemo: React.FC = () => {
  const mockMessageData: MessageBubbleData = {
    id: 'demo-message-1',
    content: bubbleDemoMarkdownSample,
    role: 'assistant',
    createAt: 1703123456789, // 2023-12-21 10:30:56
    updateAt: 1703123456789,
    isFinished: true,
    model: 'gpt-4',
    name: 'AI助手',
  };

  // 自定义 beforeContent 渲染函数
  const customBeforeContentRender = (props: any) => {
    const messageData = props.originData;
    return (
      <div
        style={{
          padding: '8px 12px',
          background: '#f5f5f5',
          borderRadius: '6px',
          marginBottom: '8px',
          fontSize: '12px',
          color: '#666',
          border: '1px solid #e8e8e8',
        }}
      >
        📝 <strong>消息信息</strong>
        <br />
        创建时间: 2023-12-21 10:30:56
        <br />
        模型: {messageData?.model || '未知'}
        <br />
        发送者: {messageData?.name || '未知'}
      </div>
    );
  };

  // 自定义 afterContent 渲染函数
  const customAfterContentRender = (props: any) => {
    const messageData = props.originData;
    return (
      <div
        style={{
          padding: '8px 12px',
          background: '#e6f7ff',
          borderRadius: '6px',
          marginTop: '8px',
          fontSize: '12px',
          color: '#1890ff',
          border: '1px solid #91d5ff',
        }}
      >
        ✅ <strong>状态信息</strong>
        <br />
        消息状态: {messageData?.isFinished ? '✅ 已完成' : '⏳ 生成中...'}
        <br />
        角色: {messageData?.role === 'assistant' ? '🤖 AI助手' : '👤 用户'}
        <br />
        消息ID: {messageData?.id}
      </div>
    );
  };

  return (
    <BubbleDemoCard
      title="📝 afterContent 和 beforeContent 渲染演示"
      description="这个演示展示了如何使用 afterContentRender 和 beforeContentRender 在消息内容的前后添加自定义内容"
      showCodeExample={true}
      codeExample={`// 自定义 beforeContent 渲染函数
const customBeforeContentRender = (props) => {
  const messageData = props.originData;
  return (
    <div style={{
      padding: '8px 12px',
      background: '#f5f5f5',
      borderRadius: '6px',
      marginBottom: '8px',
      fontSize: '12px',
      color: '#666'
    }}>
      📝 消息创建时间: 2023-12-21 10:30:56
    </div>
  );
};

// 自定义 afterContent 渲染函数
const customAfterContentRender = (props) => {
  const messageData = props.originData;
  return (
    <div style={{
      padding: '8px 12px',
      background: '#e6f7ff',
      borderRadius: '6px',
      marginTop: '8px',
      fontSize: '12px',
      color: '#1890ff'
    }}>
      ✅ 消息状态: 已完成
    </div>
  );
};

// 使用配置
<Bubble
  originData={messageData}
  bubbleRenderConfig={{
    beforeContentRender: customBeforeContentRender,
    afterContentRender: customAfterContentRender,
  }}
/>`}
    >
      <div style={{ padding: 24 }}>
        <Bubble
          originData={mockMessageData}
          pure
          bubbleRenderConfig={{
            beforeMessageRender: customBeforeContentRender,
            afterMessageRender: customAfterContentRender,
          }}
        />
      </div>

      <div
        style={{
          padding: 16,
          background: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <strong>📖 功能说明：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <strong>beforeContentRender:</strong> 在消息内容前面添加自定义内容
          </li>
          <li>
            <strong>afterContentRender:</strong> 在消息内容后面添加自定义内容
          </li>
          <li>
            <strong>参数:</strong> 两个函数都接收 props 和 defaultDom 参数
          </li>
          <li>
            <strong>返回值:</strong> 可以返回任何有效的 React 节点
          </li>
          <li>
            <strong>禁用:</strong> 设置为 false 可以禁用对应的渲染
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};

export default AfterContentBeforeContentDemo;
