import type { BubbleProps } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import { LoadingOutlined } from '@ant-design/icons';
import { Button, Progress, Space, Spin, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';
import { createAssistantMessage, createUserMessage, PURE_TABLE_CONFIG } from './shared';

type ContentStyle = 'default' | 'metadata' | 'loading' | 'enhanced';

const CONTENT_STYLE_LABELS: Record<ContentStyle, string> = {
  default: '使用默认内容渲染',
  metadata: '显示元数据信息（模型、耗时、置信度等）',
  loading: '显示加载状态和进度条',
  enhanced: '显示完整的增强信息（状态、进度、详细信息、标签）',
};

const mockMessages = [
  createAssistantMessage(
    '1',
    `# contentRender 自定义内容渲染演示

contentRender 允许你完全自定义消息气泡的内容区域，可以：
- 🎨 **样式定制**：自定义内容的样式和布局
- 📊 **元数据显示**：显示模型信息、耗时、置信度等
- ⏳ **加载状态**：自定义加载中的显示效果`,
    {
      createAt: Date.now() - 120000,
      updateAt: Date.now() - 120000,
      extra: { status: 'success', model: 'GPT-4', duration: 2300, confidence: 0.95 },
    },
  ),
  createUserMessage(
    '2',
    '请帮我分析这段代码的性能问题，并提供优化建议。',
    {
      createAt: Date.now() - 60000,
      updateAt: Date.now() - 60000,
      extra: { location: '上海', device: 'Desktop', browser: 'Chrome 120' },
    },
  ),
  createAssistantMessage(
    '3',
    `## 性能分析报告

### 问题识别
1. **内存泄漏**：事件监听器未正确清理
2. **重复渲染**：组件缺少 memo 优化

### 预期效果
- 性能提升 40%
- 内存使用减少 30%`,
    {
      createAt: Date.now() - 10000,
      updateAt: Date.now() - 10000,
      extra: { status: 'in_progress', model: 'GPT-4', duration: 1800, confidence: 0.88, progress: 75, customTags: ['性能分析', 'React'] },
    },
  ),
];

const MetaInfoRow: React.FC<{ items: { icon: string; label: string; value: string | number }[] }> = ({ items }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {items.filter(Boolean).map(({ icon, label, value }) => (
      <span key={label}>{icon} {label}: {value}</span>
    ))}
  </div>
);

export default () => {
  const bubbleRef = useRef<any>();
  const [contentStyle, setContentStyle] = useState<ContentStyle>('default');

  const defaultContentRender = (_props: BubbleProps, defaultDom: React.ReactNode) => defaultDom;

  const metadataContentRender = (props: BubbleProps, defaultDom: React.ReactNode) => {
    const extra = props.originData?.extra;
    if (!extra) return defaultDom;

    const isAssistant = props.originData?.role === 'assistant';
    const items = [
      extra.model && { icon: '🤖', label: '模型', value: extra.model },
      extra.duration && { icon: '⏱️', label: '耗时', value: `${extra.duration}ms` },
      extra.confidence && { icon: '📊', label: '置信度', value: `${(extra.confidence * 100).toFixed(0)}%` },
      extra.location && { icon: '📍', label: '位置', value: extra.location },
      extra.device && { icon: '💻', label: '设备', value: extra.device },
    ].filter(Boolean) as { icon: string; label: string; value: string }[];

    return (
      <div>
        <div style={{ marginBottom: 12 }}>{defaultDom}</div>
        <div style={{ padding: '8px 12px', background: isAssistant ? '#f6ffed' : '#f0f5ff', borderRadius: 6, fontSize: 12, color: '#666', borderLeft: `3px solid ${isAssistant ? '#52c41a' : '#1890ff'}` }}>
          <MetaInfoRow items={items} />
        </div>
      </div>
    );
  };

  const loadingContentRender = (props: BubbleProps, defaultDom: React.ReactNode) => {
    const extra = props.originData?.extra;
    const isLoading = extra?.status === 'in_progress';

    if (isLoading) {
      return (
        <div style={{ padding: 16, textAlign: 'center', background: '#f8f9fa', borderRadius: 8, border: '1px dashed #d9d9d9' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>🤖 AI 正在思考...</div>
          {extra?.progress && <Progress percent={extra.progress} size="small" status="active" style={{ maxWidth: 200, margin: '12px auto 0' }} />}
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: 12 }}>{defaultDom}</div>
        {extra && (
          <div style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 6, fontSize: 12, color: '#666', borderLeft: '3px solid #52c41a' }}>
            <MetaInfoRow items={[
              { icon: '✅', label: '状态', value: '处理完成' },
              ...(extra.duration ? [{ icon: '⏱️', label: '耗时', value: `${extra.duration}ms` }] : []),
              ...(extra.confidence ? [{ icon: '📊', label: '置信度', value: `${(extra.confidence * 100).toFixed(0)}%` }] : []),
            ]} />
          </div>
        )}
      </div>
    );
  };

  const enhancedContentRender = (props: BubbleProps, defaultDom: React.ReactNode) => {
    const extra = props.originData?.extra;
    if (!extra) return defaultDom;
    const isLoading = extra.status === 'in_progress';

    const infoItems = [
      extra.model && { icon: '🤖', label: '模型', value: extra.model },
      extra.duration && { icon: '⏱️', label: '耗时', value: `${extra.duration}ms` },
      extra.confidence && { icon: '📊', label: '置信度', value: `${(extra.confidence * 100).toFixed(0)}%` },
      extra.location && { icon: '📍', label: '位置', value: extra.location },
      extra.device && { icon: '💻', label: '设备', value: extra.device },
      extra.browser && { icon: '🌐', label: '浏览器', value: extra.browser },
    ].filter(Boolean) as { icon: string; label: string; value: string }[];

    return (
      <div>
        <div style={{ marginBottom: 16 }}>{defaultDom}</div>
        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #f6ffed 0%, #f0f5ff 100%)', borderRadius: 8, border: '1px solid #d9d9d9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{isLoading ? '🔄 处理中' : '✅ 已完成'}</span>
            {extra.priority && <Tag color={extra.priority === 'high' ? 'red' : 'default'}>{extra.priority === 'high' ? '🔥 高优先级' : '📋 普通'}</Tag>}
          </div>
          {isLoading && extra.progress && <Progress percent={extra.progress} size="small" status="active" strokeColor="#1890ff" />}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12, marginTop: 12 }}>
            {infoItems.map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>{icon}</span><span>{label}: {value}</span>
              </div>
            ))}
          </div>
          {extra.customTags?.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #d9d9d9' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {extra.customTags.map((tag: string) => <Tag key={tag} color="blue" style={{ fontSize: 11 }}>{tag}</Tag>)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const contentRenders: Record<ContentStyle, (p: BubbleProps, d: React.ReactNode) => React.ReactNode> = {
    default: defaultContentRender,
    metadata: metadataContentRender,
    loading: loadingContentRender,
    enhanced: enhancedContentRender,
  };

  return (
    <BubbleDemoCard
      title="contentRender 自定义内容渲染"
      description="展示如何使用 contentRender 自定义消息气泡的内容区域"
    >
      <div style={{ padding: 24, paddingBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>内容样式：</span>
          <Space>
            {(Object.keys(CONTENT_STYLE_LABELS) as ContentStyle[]).map((key) => (
              <Button key={key} type={contentStyle === key ? 'primary' : 'default'} onClick={() => setContentStyle(key)}>
                {key === 'default' ? '默认样式' : key === 'metadata' ? '元数据展示' : key === 'loading' ? '加载状态' : '增强样式'}
              </Button>
            ))}
          </Space>
        </div>
        <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, fontSize: 14, color: '#666' }}>
          <strong>当前样式：</strong>{CONTENT_STYLE_LABELS[contentStyle]}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mockMessages.map((msg) => (
          <Bubble
            key={msg.id}
            markdownRenderConfig={PURE_TABLE_CONFIG}
            avatar={msg.meta!}
            placement={msg.role === 'user' ? 'right' : 'left'}
            bubbleRef={bubbleRef}
            pure
            originData={msg}
            bubbleRenderConfig={{ contentRender: contentRenders[contentStyle] }}
          />
        ))}
      </div>
    </BubbleDemoCard>
  );
};
