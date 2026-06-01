import type {
  ChatLayoutRef,
  ChatLayoutScrollState,
} from '@ant-design/agentic-ui';
import { ChatLayout } from '@ant-design/agentic-ui';
import {
  Button,
  Card,
  Divider,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  message,
} from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const generateMessages = (count: number) =>
  Array.from({ length: count }).map((_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    content:
      i % 2 === 0
        ? `这是用户消息 #${i + 1}，用于演示 ChatLayout 的滚动行为。`
        : `这是 AI 回复 #${i + 1}：可以根据 scrollBehavior 选择 smooth 或 auto，
便于流式输出场景下避免抖动。`,
  }));

const SCROLL_OPTIONS = [
  { label: 'smooth (推荐流式)', value: 'smooth' as const },
  { label: 'auto (立即)', value: 'auto' as const },
];

export default () => {
  const [count, setCount] = useState(20);
  const [scrollBehavior, setScrollBehavior] = useState<'smooth' | 'auto'>(
    'smooth',
  );
  const [showFooter, setShowFooter] = useState(true);
  const [showFooterBackground, setShowFooterBackground] = useState(true);
  const [footerHeight, setFooterHeight] = useState(96);
  const [showHeader, setShowHeader] = useState(true);
  const [title, setTitle] = useState('对话窗口');
  const [scrollState, setScrollState] = useState<ChatLayoutScrollState>({
    isAtBottom: true,
    isPinned: true,
  });
  const [draftInput, setDraftInput] = useState('');

  const ref = useRef<ChatLayoutRef>(null);

  const messages = useMemo(() => generateMessages(count), [count]);

  const handleAppend = () => {
    setCount((c) => c + 1);
  };

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Card title="1. 头部 / 底部开关" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap size="large">
            <Space>
              <span>showHeader</span>
              <Switch checked={showHeader} onChange={setShowHeader} />
            </Space>
            <Space>
              <span>title</span>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: 200 }}
              />
            </Space>
            <Space>
              <span>showFooter</span>
              <Switch checked={showFooter} onChange={setShowFooter} />
            </Space>
            <Space>
              <span>showFooterBackground</span>
              <Switch
                checked={showFooterBackground}
                onChange={setShowFooterBackground}
              />
            </Space>
            <Space>
              <span>footerHeight</span>
              <InputNumber
                min={0}
                max={400}
                value={footerHeight}
                onChange={(v) => setFooterHeight(v ?? 96)}
                addonAfter="px"
              />
            </Space>
          </Space>
        </Space>
      </Card>

      <Card title="2. 滚动行为与命令式控制" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap size="large">
            <Space>
              <span>scrollBehavior</span>
              <Select
                value={scrollBehavior}
                onChange={setScrollBehavior}
                style={{ width: 180 }}
                options={SCROLL_OPTIONS}
              />
            </Space>
            <Space>
              <span>消息数量</span>
              <InputNumber
                min={0}
                max={500}
                value={count}
                onChange={(v) => setCount(v ?? 0)}
              />
            </Space>
          </Space>
          <Space wrap>
            <Button onClick={handleAppend}>追加 1 条消息</Button>
            <Button
              onClick={() => ref.current?.scrollToBottom('auto')}
              type="primary"
            >
              ref.scrollToBottom('auto')
            </Button>
            <Button onClick={() => ref.current?.scrollToBottom('smooth')}>
              ref.scrollToBottom('smooth')
            </Button>
            <Button
              onClick={() => {
                const atBottom = ref.current?.isAtBottom();
                message.info(`isAtBottom = ${atBottom}`);
              }}
            >
              ref.isAtBottom()
            </Button>
            <Tag color={scrollState.isAtBottom ? 'green' : 'orange'}>
              isAtBottom: {String(scrollState.isAtBottom)}
            </Tag>
            <Tag color={scrollState.isPinned ? 'green' : 'orange'}>
              isPinned: {String(scrollState.isPinned)}
            </Tag>
          </Space>
        </Space>
      </Card>

      <Card title="3. 实时预览" size="small">
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            overflow: 'hidden',
            height: 520,
          }}
        >
          <ChatLayout
            ref={ref}
            header={
              showHeader
                ? { title, leftCollapsible: true, showShare: true }
                : undefined
            }
            scrollBehavior={scrollBehavior}
            footerHeight={showFooter ? footerHeight : 0}
            showFooterBackground={showFooterBackground}
            onScrollStateChange={setScrollState}
            footer={
              showFooter ? (
                <div
                  style={{
                    height: footerHeight,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Input
                    value={draftInput}
                    onChange={(e) => setDraftInput(e.target.value)}
                    placeholder="模拟输入区..."
                    onPressEnter={() => {
                      if (!draftInput.trim()) return;
                      setCount((c) => c + 1);
                      setDraftInput('');
                    }}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      if (!draftInput.trim()) return;
                      setCount((c) => c + 1);
                      setDraftInput('');
                    }}
                  >
                    发送
                  </Button>
                </div>
              ) : undefined
            }
          >
            <div
              style={{
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: m.role === 'user' ? '#1677ff' : '#f5f5f5',
                    color: m.role === 'user' ? '#fff' : '#262626',
                    padding: '8px 12px',
                    borderRadius: 12,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              ))}
            </div>
          </ChatLayout>
        </div>
      </Card>

      <Card title="4. 自定义 classNames / styles 局部覆盖" size="small">
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            overflow: 'hidden',
            height: 320,
          }}
        >
          <ChatLayout
            header={{ title: '自定义样式示例' }}
            footer={
              <div style={{ padding: 12, textAlign: 'center', color: '#999' }}>
                自定义底部
              </div>
            }
            footerHeight={48}
            classNames={{ root: 'my-chat-layout-root' }}
            styles={{
              root: {
                background: 'linear-gradient(180deg, #f0f5ff 0%, #ffffff 100%)',
              },
              footerBackground: {
                background: '#e6f4ff',
                borderTop: '1px dashed #91caff',
              },
            }}
          >
            <div style={{ padding: 16 }}>
              <p>
                通过 classNames / styles 可分别覆盖 root / content / scrollable
                / footer / footerBackground 五个区域。
              </p>
            </div>
          </ChatLayout>
        </div>
      </Card>

      <Divider style={{ margin: 0 }} />
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        提示：上滑离开底部后 isPinned 会变 false；通过 ref.scrollToBottom
        可显式贴底，组件会重新进入「跟随底部」状态。
      </div>
    </div>
  );
};
