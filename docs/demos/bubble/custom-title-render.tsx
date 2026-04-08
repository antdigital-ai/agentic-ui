import type { MessageBubbleData } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createAssistantMessage,
  createUserMessage,
  PURE_TABLE_CONFIG,
} from './shared';

const mockMessages = [
  createAssistantMessage(
    '1',
    `# 自定义标题渲染演示

Bubble 组件支持自定义标题渲染，可以：

## 功能特点
- 🎨 **样式定制**：自定义标题的样式和布局
- 🏷️ **标签显示**：添加状态标签、优先级等
- 👤 **角色标识**：显示用户角色和状态
- ⏰ **时间信息**：显示消息时间戳`,
    {
      createAt: Date.now() - 120000,
      updateAt: Date.now() - 120000,
      meta: { avatar: undefined, title: 'Code Assistant', description: '代码助手 v2.1' },
      extra: { status: 'success', priority: 'high', customTags: ['代码优化', '性能'], model: 'GPT-4', duration: 2300, confidence: 0.95 },
    },
  ),
  createUserMessage('2', '这个功能很实用！能演示一下不同的标题渲染效果吗？', {
    createAt: Date.now() - 60000,
    updateAt: Date.now() - 60000,
    meta: { avatar: undefined, title: '前端开发者', description: '高级工程师' },
    extra: { location: '上海', device: 'Desktop', online: true },
  }),
  createAssistantMessage(
    '3',
    `## 自定义标题渲染示例

### 默认模式
显示基本的标题和描述信息。

### 自定义模式
添加状态标签、优先级标识等。

### 增强模式
包含更多详细信息，如时间戳、统计信息等。`,
    {
      createAt: Date.now() - 10000,
      updateAt: Date.now() - 10000,
      meta: { avatar: undefined, title: 'Code Assistant', description: '代码助手 v2.1' },
      extra: { status: 'processing', priority: 'medium', model: 'GPT-4', duration: 1500, confidence: 0.88 },
    },
  ),
];

type RenderMode = 'default' | 'custom' | 'enhanced';

export default () => {
  const bubbleRef = useRef<any>();
  const [renderMode, setRenderMode] = useState<RenderMode>('default');

  const defaultTitleRender = (props: any) => {
    const { meta } = props.originData;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>{meta.title}</span>
        <span style={{ color: '#666', fontSize: 12 }}>{meta.description}</span>
      </div>
    );
  };

  const customTitleRender = (props: any) => {
    const { meta, extra } = props.originData;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>{meta.title}</span>
        {extra?.status && (
          <Tag
            color={extra.status === 'success' ? 'green' : extra.status === 'processing' ? 'blue' : 'red'}
            icon={extra.status === 'success' ? <CheckCircleOutlined /> : extra.status === 'processing' ? <ClockCircleOutlined /> : <ExclamationCircleOutlined />}
          >
            {extra.status}
          </Tag>
        )}
        {extra?.priority && (
          <Tag color={extra.priority === 'high' ? 'red' : extra.priority === 'medium' ? 'orange' : 'green'}>
            {extra.priority}
          </Tag>
        )}
        {extra?.model && <Tag color="purple">{extra.model}</Tag>}
      </div>
    );
  };

  const enhancedTitleRender = (props: any) => {
    const { meta, extra, createAt } = props.originData;
    const timeStr = new Date(createAt).toLocaleTimeString();
    const isAssistant = props.originData.role === 'assistant';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Avatar
            size="small"
            src={meta.avatar}
            icon={isAssistant ? <RobotOutlined /> : <UserOutlined />}
          />
          <span style={{ fontWeight: 600 }}>{meta.title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {extra?.status && (
            <Badge
              status={extra.status === 'success' ? 'success' : extra.status === 'processing' ? 'processing' : 'error'}
              text={extra.status}
            />
          )}
          {extra?.duration && <span style={{ fontSize: 12, color: '#666' }}>⏱️ {extra.duration}ms</span>}
          {extra?.confidence && (
            <span style={{ fontSize: 12, color: '#666' }}>🎯 {(extra.confidence * 100).toFixed(0)}%</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#999' }}>{timeStr}</div>
      </div>
    );
  };

  const titleRenders: Record<RenderMode, (props: any) => React.ReactNode> = {
    default: defaultTitleRender,
    custom: customTitleRender,
    enhanced: enhancedTitleRender,
  };

  const handleLike = async (bubble: MessageBubbleData) => console.log('点赞消息:', bubble);
  const handleDisLike = async (bubble: MessageBubbleData) => console.log('点踩消息:', bubble);
  const handleReply = (content: string) => console.log('回复内容:', content);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h3>自定义标题渲染控制</h3>
        <Space>
          {(['default', 'custom', 'enhanced'] as const).map((mode) => (
            <Button
              key={mode}
              type={renderMode === mode ? 'primary' : 'default'}
              onClick={() => setRenderMode(mode)}
            >
              {mode === 'default' ? '默认模式' : mode === 'custom' ? '自定义模式' : '增强模式'}
            </Button>
          ))}
        </Space>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mockMessages.map((msg) => (
          <Bubble
            key={msg.id}
            avatar={msg.meta!}
            markdownRenderConfig={PURE_TABLE_CONFIG}
            placement={msg.role === 'assistant' ? 'left' : 'right'}
            bubbleRef={bubbleRef}
            pure
            originData={msg}
            onLike={handleLike}
            onDisLike={handleDisLike}
            onReply={handleReply}
            bubbleRenderConfig={{ titleRender: titleRenders[renderMode] }}
          />
        ))}
      </div>
    </div>
  );
};
