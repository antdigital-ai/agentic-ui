import {
  AnswerAlert,
  Bubble,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Button, message, Space, Switch } from 'antd';
import React, { useRef, useState } from 'react';

// Mock data for the demo
const mockMessage: MessageBubbleData = {
  id: '1',
  role: 'assistant',
  content: `# 消息加载状态演示

这是一个展示 Bubble 组件消息加载状态的示例。

当消息正在生成时，组件会显示：
- 加载动画
- 占位内容
- 禁用交互操作

你可以通过下方的开关来控制加载状态。`,
  createAt: Date.now() - 60000,
  updateAt: Date.now() - 60000,
  isFinished: true,
  extra: {
    duration: 1200,
    model: 'gpt-4',
    tokens: 150,
  },
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'Ant Design Assistant',
    description: 'AI 助手',
  },
};

export default () => {
  const bubbleRef = useRef<any>();
  const [isLoading, setIsLoading] = useState(false);

  // 处理点赞/点踩事件
  const handleLike = async (bubble: MessageBubbleData) => {
    message.success(`已点赞消息: ${bubble.id}`);
    console.log('点赞消息:', bubble);
  };

  const handleDisLike = async (bubble: MessageBubbleData) => {
    message.info(`已点踩消息: ${bubble.id}`);
    console.log('点踩消息:', bubble);
  };

  // 处理回复事件
  const handleReply = (content: string) => {
    message.info(`回复内容: ${content}`);
    console.log('回复内容:', content);
  };

  // 模拟消息生成过程
  const simulateMessageGeneration = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      message.success('消息生成完成！');
    }, 3000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* 控制区域 */}
      <div style={{ marginBottom: 24 }}>
        <h3>🎯 消息加载状态控制</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Space>
              <span>消息加载状态：</span>
              <Switch
                checked={isLoading}
                onChange={setIsLoading}
                checkedChildren="加载中"
                unCheckedChildren="已完成"
              />
              <Button type="primary" onClick={simulateMessageGeneration}>
                模拟生成过程
              </Button>
            </Space>
          </div>
        </Space>
        <div style={{ marginTop: 8, color: '#666', fontSize: 14 }}>
          💡 切换开关或点击按钮来体验消息加载状态
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 基础消息加载状态 */}
        <Bubble
          avatar={mockMessage.meta!}
          placement="left"
          bubbleRef={bubbleRef}
          pure
          originData={{
            ...mockMessage,
            typing: isLoading,
            content: isLoading ? (
              <AnswerAlert
                message="正在思考中，请稍候..."
                type="gray"
                showIcon
                closable
              />
            ) : (
              mockMessage.content
            ),
            isFinished: !isLoading,
          }}
          onLike={handleLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
        />

        {/* 用户消息（对比） */}
        <Bubble
          avatar={{
            avatar:
              'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
            title: '开发者',
            description: '前端工程师',
          }}
          placement="right"
          bubbleRef={bubbleRef}
          pure
          originData={{
            id: '3',
            role: 'user',
            content: '请展示一下消息加载状态的效果',
            createAt: Date.now() - 10000,
            updateAt: Date.now() - 10000,
            isFinished: true,
            meta: {
              avatar:
                'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
              title: '开发者',
              description: '前端工程师',
            },
          }}
          onReply={handleReply}
        />
      </div>

      {/* 功能说明 */}
      <div
        style={{
          marginTop: 32,
          padding: 16,
          backgroundColor: '#f8f9fa',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>🔄 消息加载状态功能说明</h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>loading 属性：</strong>控制是否显示加载状态
          </li>
          <li>
            <strong>加载动画：</strong>显示动态的加载指示器
          </li>
          <li>
            <strong>占位内容：</strong>在加载期间显示占位文本
          </li>
          <li>
            <strong>交互禁用：</strong>加载期间禁用点赞、点踩等操作
          </li>
          <li>
            <strong>状态同步：</strong>isFinished 属性与 loading 状态同步
          </li>
          <li>
            <strong>typing 属性：</strong>控制是否显示打字效果
          </li>
        </ul>
      </div>

      {/* API 说明 */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          backgroundColor: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>📖 API 说明</h4>
        <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
          <div>
            <strong>loading:</strong> boolean - 控制是否显示加载状态
          </div>
          <div>
            <strong>typing:</strong> boolean - 控制是否显示打字效果
          </div>
          <div>
            <strong>isFinished:</strong> boolean - 消息是否完成生成
          </div>
        </div>
      </div>
    </div>
  );
};
