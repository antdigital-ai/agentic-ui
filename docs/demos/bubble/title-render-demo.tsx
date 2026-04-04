import type { BubbleProps } from '@ant-design/agentic-ui';
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

const STATUS_CONFIG: Record<
  string,
  { color: string; badgeStatus: 'success' | 'processing' | 'error'; label: string; icon: React.ReactNode }
> = {
  success: { color: 'green', badgeStatus: 'success', label: '已完成', icon: <CheckCircleOutlined /> },
  in_progress: { color: 'blue', badgeStatus: 'processing', label: '进行中', icon: <ClockCircleOutlined /> },
  default: { color: 'orange', badgeStatus: 'error', label: '待处理', icon: <ExclamationCircleOutlined /> },
};

const getStatusConfig = (status?: string) =>
  STATUS_CONFIG[status || ''] || STATUS_CONFIG.default;

const mockMessages = [
  createAssistantMessage(
    '1',
    `# titleRender 自定义渲染演示

titleRender 允许你完全自定义消息气泡的标题区域，可以：

## 功能特点
- 🎨 **样式定制**：自定义标题的样式和布局
- 🏷️ **状态标签**：显示消息状态（成功、进行中、错误）
- ⭐ **优先级标识**：显示消息优先级（高、中、低）
- 🏷️ **自定义标签**：添加业务相关的标签
- 👤 **角色图标**：显示用户或AI助手图标`,
    {
      createAt: Date.now() - 120000,
      updateAt: Date.now() - 120000,
      extra: {
        status: 'success',
        priority: 'high',
        customTags: ['代码优化', '性能'],
        model: 'GPT-4',
        duration: 2300,
        confidence: 0.95,
      },
    },
  ),
  createUserMessage(
    '2',
    '请帮我优化这段代码的性能，有什么建议吗？',
    { createAt: Date.now() - 60000, updateAt: Date.now() - 60000 },
  ),
  createAssistantMessage(
    '3',
    `## 代码优化建议

### 1. 使用 React.memo
\`\`\`typescript
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data.title}</div>;
});
\`\`\`

### 2. 使用 useCallback
\`\`\`typescript
const handleClick = useCallback(() => {
  // 处理点击事件
}, [dependency]);
\`\`\`

这样可以避免不必要的重渲染。`,
    {
      createAt: Date.now() - 10000,
      updateAt: Date.now() - 10000,
      extra: {
        status: 'in_progress',
        priority: 'medium',
        customTags: ['实现指南', 'React'],
        model: 'GPT-4',
        duration: 1800,
        confidence: 0.88,
      },
    },
  ),
];

type TitleStyle = 'default' | 'status' | 'priority' | 'enhanced';

const TITLE_STYLE_LABELS: Record<TitleStyle, { label: string; desc: string }> = {
  default: { label: '默认样式', desc: '使用默认标题渲染' },
  status: { label: '状态标签', desc: '显示状态标签（成功、进行中、错误）' },
  priority: { label: '优先级标签', desc: '显示优先级标签和自定义标签' },
  enhanced: { label: '增强样式', desc: '显示完整信息（状态、耗时、置信度、时间）' },
};

export default () => {
  const bubbleRef = useRef<any>();
  const [titleStyle, setTitleStyle] = useState<TitleStyle>('default');

  const defaultTitleRender = (_props: BubbleProps, defaultDom: React.ReactNode) => defaultDom;

  const statusTitleRender = (props: BubbleProps, defaultDom: React.ReactNode) => {
    const { originData } = props;
    const isAssistant = originData?.role === 'assistant';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>
          {isAssistant ? <RobotOutlined /> : <UserOutlined />}
        </span>
        <span style={{ flex: 1 }}>{defaultDom}</span>
        {originData?.extra?.status && (() => {
          const cfg = getStatusConfig(originData.extra.status);
          return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>;
        })()}
      </div>
    );
  };

  const priorityTitleRender = (props: BubbleProps, defaultDom: React.ReactNode) => {
    const { originData } = props;
    const isAssistant = originData?.role === 'assistant';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>
          {isAssistant ? <RobotOutlined /> : <UserOutlined />}
        </span>
        <span style={{ flex: 1 }}>{defaultDom}</span>
        {originData?.extra?.priority && (
          <Tag color={originData.extra.priority === 'high' ? 'red' : 'default'}>
            {originData.extra.priority === 'high' ? '🔥 高优先级' : '📋 普通'}
          </Tag>
        )}
        {originData?.extra?.customTags?.map((tag: string) => (
          <Tag key={tag} color="blue" style={{ fontSize: 12 }}>{tag}</Tag>
        ))}
      </div>
    );
  };

  const enhancedTitleRender = (props: BubbleProps, defaultDom: React.ReactNode) => {
    const { originData } = props;
    const isAssistant = originData?.role === 'assistant';
    const timeStr = new Date(originData?.createAt || Date.now()).toLocaleTimeString();

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Avatar
            size="small"
            src={originData?.meta?.avatar}
            icon={isAssistant ? <RobotOutlined /> : <UserOutlined />}
          />
          <span style={{ fontWeight: 600 }}>{defaultDom}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {originData?.extra?.status && (
            <Badge status={getStatusConfig(originData.extra.status).badgeStatus} text={originData.extra.status} />
          )}
          {originData?.extra?.duration && (
            <span style={{ fontSize: 12, color: '#666' }}>⏱️ {originData.extra.duration}ms</span>
          )}
          {originData?.extra?.confidence && (
            <span style={{ fontSize: 12, color: '#666' }}>
              🎯 {(originData.extra.confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#999' }}>{timeStr}</div>
      </div>
    );
  };

  const titleRenders: Record<TitleStyle, (props: BubbleProps, dom: React.ReactNode) => React.ReactNode> = {
    default: defaultTitleRender,
    status: statusTitleRender,
    priority: priorityTitleRender,
    enhanced: enhancedTitleRender,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h3>titleRender 自定义标题渲染</h3>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>标题样式：</span>
          <Space>
            {(Object.keys(TITLE_STYLE_LABELS) as TitleStyle[]).map((key) => (
              <Button
                key={key}
                type={titleStyle === key ? 'primary' : 'default'}
                onClick={() => setTitleStyle(key)}
              >
                {TITLE_STYLE_LABELS[key].label}
              </Button>
            ))}
          </Space>
        </div>
        <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, fontSize: 14, color: '#666' }}>
          <strong>当前样式：</strong>{TITLE_STYLE_LABELS[titleStyle].desc}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mockMessages.map((msg) => (
          <Bubble
            key={msg.id}
            avatar={msg.meta!}
            placement={msg.role === 'user' ? 'right' : 'left'}
            bubbleRef={bubbleRef}
            pure
            originData={msg}
            bubbleRenderConfig={{ titleRender: titleRenders[titleStyle] }}
            markdownRenderConfig={PURE_TABLE_CONFIG}
          />
        ))}
      </div>
    </div>
  );
};
