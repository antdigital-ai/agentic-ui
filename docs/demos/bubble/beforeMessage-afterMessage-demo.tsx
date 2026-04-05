import { Bubble, MessageBubbleData } from '@ant-design/agentic-ui';
import React from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';
import { bubbleDemoMarkdownSample } from './sharedDemoContent';

const BeforeMessageAfterMessageDemo: React.FC = () => {
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

  // 自定义 beforeMessageRender 渲染函数
  const customBeforeMessageRender = (props: any) => {
    const messageData = props.originData;
    return (
      <div
        style={{
          padding: '8px 12px',
          background: '#f6ffed',
          borderRadius: '6px',
          marginBottom: '8px',
          fontSize: '12px',
          color: '#52c41a',
          border: '1px solid #b7eb8f',
        }}
      >
        🔍 <strong>消息分析</strong>
        <br />
        模型: {messageData?.model || '未知'}
        <br />
        发送者: {messageData?.name || '未知'}
        <br />
        创建时间: 2023-12-21 10:30:56
      </div>
    );
  };

  // 自定义 afterMessageRender 渲染函数
  const customAfterMessageRender = (props: any) => {
    const messageData = props.originData;
    return (
      <div
        style={{
          padding: '8px 12px',
          background: '#fff7e6',
          borderRadius: '6px',
          marginTop: '8px',
          fontSize: '12px',
          color: '#fa8c16',
          border: '1px solid #ffd591',
        }}
      >
        📊 <strong>生成统计</strong>
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
      title="📝 beforeMessageRender 和 afterMessageRender 渲染演示"
      description="这个演示展示了如何使用 beforeMessageRender 和 afterMessageRender 在消息内容的前后添加自定义内容"
    >
      <div style={{ padding: 24 }}>
        <Bubble
          originData={mockMessageData}
          pure
          bubbleRenderConfig={{
            beforeMessageRender: customBeforeMessageRender,
            afterMessageRender: customAfterMessageRender,
          }}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3>代码示例</h3>
        <pre
          style={{
            background: '#f6f8fa',
            padding: '16px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '13px',
          }}
        >
          {`// 自定义 beforeMessageRender 渲染函数
const customBeforeMessageRender = (props) => {
  const messageData = props.originData;
  return (
    <div style={{
      padding: '8px 12px',
      background: '#f6ffed',
      borderRadius: '6px',
      marginBottom: '8px',
      fontSize: '12px',
      color: '#52c41a'
    }}>
      🔍 模型: gpt-4
    </div>
  );
};

// 自定义 afterMessageRender 渲染函数
const customAfterMessageRender = (props) => {
  const messageData = props.originData;
  return (
    <div style={{
      padding: '8px 12px',
      background: '#fff7e6',
      borderRadius: '6px',
      marginTop: '8px',
      fontSize: '12px',
      color: '#fa8c16'
    }}>
      📊 消息状态: 已完成
    </div>
  );
};

// 使用配置
<Bubble
  originData={messageData}
  bubbleRenderConfig={{
    beforeMessageRender: customBeforeMessageRender,
    afterMessageRender: customAfterMessageRender,
  }}
/>`}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>功能说明</h3>
        <ul>
          <li>
            <strong>beforeMessageRender</strong>: 在消息内容前面添加自定义内容
          </li>
          <li>
            <strong>afterMessageRender</strong>: 在消息内容后面添加自定义内容
          </li>
          <li>
            <strong>参数</strong>: 两个函数都接收 <code>props</code> 和{' '}
            <code>defaultDom</code> 参数
          </li>
          <li>
            <strong>返回值</strong>: 可以返回任何有效的 React 节点
          </li>
          <li>
            <strong>禁用</strong>: 设置为 <code>false</code> 可以禁用对应的渲染
          </li>
          <li>
            <strong>适用性</strong>: 在所有消息类型中都生效（用户消息和 AI
            消息）
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>与 beforeContentRender/afterContentRender 的区别</h3>
        <ul>
          <li>
            <strong>beforeMessageRender/afterMessageRender</strong>: 更新的
            API，在所有消息类型中都生效
          </li>
          <li>
            <strong>beforeContentRender/afterContentRender</strong>: 较旧的
            API，仅在左侧消息（AI 回复）中生效
          </li>
          <li>
            <strong>建议</strong>: 优先使用 <code>beforeMessageRender</code> 和{' '}
            <code>afterMessageRender</code>
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};

export default BeforeMessageAfterMessageDemo;
