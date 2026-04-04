import type { BubbleMetaData } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import { Card, Space, Switch, Typography } from 'antd';
import React, { useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';
import {
  ASSISTANT_AVATAR,
  createAssistantMessage,
  createUserMessage,
  PURE_TABLE_CONFIG,
  USER_AVATAR,
} from './shared';

const { Text, Title } = Typography;

const ASSISTANT_DESIGN_META: BubbleMetaData = {
  avatar: ASSISTANT_AVATAR,
  title: 'Design System',
  description: '设计系统助手',
};

const USER_PM_META: BubbleMetaData = {
  avatar: USER_AVATAR,
  title: '产品经理',
  description: 'UI/UX 设计师',
};

const mockMessages = [
  createAssistantMessage(
    '1',
    `## Pure 模式说明

Pure 模式是 Bubble 组件的简洁版本，特点：

- 🎨 **无边框无阴影**：更简洁的视觉效果
- 📱 **适配场景**：嵌入式对话、邮件预览等
- ⚡ **轻量级**：减少视觉干扰，突出内容

适用于需要低调显示的聊天场景。`,
    { createAt: Date.now() - 180000, updateAt: Date.now() - 180000, meta: ASSISTANT_DESIGN_META },
  ),
  createUserMessage(
    '2',
    '这样看起来确实更简洁！什么时候使用 Pure 模式比较合适？',
    { createAt: Date.now() - 120000, updateAt: Date.now() - 120000, meta: USER_PM_META },
  ),
  createAssistantMessage(
    '3',
    `Pure 模式的最佳使用场景：

### 🔸 嵌入式聊天
当聊天框作为页面的一部分时，pure 模式不会抢夺用户注意力。

### 🔸 移动端适配
在小屏幕设备上，pure 模式可以节省更多空间。

| 普通模式 | Pure 模式 |
| -------- | -------- |
| 有边框和阴影 | 无边框无阴影 |
| 立体感更强 | 平面简洁设计 |
| 适合独立聊天窗口 | 更好地融入页面布局 |

试试切换下方的开关，感受两种模式的差异！`,
    { createAt: Date.now() - 60000, updateAt: Date.now() - 60000, meta: ASSISTANT_DESIGN_META },
  ),
  createUserMessage(
    '4',
    '太棒了！我现在明白了 Pure 模式的优势。能看看和普通模式的对比吗？',
    { createAt: Date.now() - 30000, updateAt: Date.now() - 30000, meta: USER_PM_META },
  ),
];

export default () => {
  const bubbleRef = useRef<any>();
  const [isPureMode, setIsPureMode] = useState(true);
  const [showComparison, setShowComparison] = useState(false);

  const renderBubble = (msg: typeof mockMessages[number], pure: boolean, keyPrefix = '') => (
    <Bubble
      key={`${keyPrefix}${msg.id}`}
      avatar={msg.meta!}
      placement={msg.role === 'user' ? 'right' : 'left'}
      bubbleRef={bubbleRef}
      originData={msg}
      pure={pure}
      markdownRenderConfig={PURE_TABLE_CONFIG}
    />
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Card
        style={{ marginBottom: 24 }}
        title={<Title level={4} style={{ margin: 0 }}>Pure 模式演示</Title>}
      >
        <Text type="secondary">
          Pure 模式提供更简洁的聊天气泡样式，适用于需要低调展示的场景。
        </Text>

        <Space size="large" style={{ display: 'flex', marginTop: 16 }}>
          <div>
            <Text strong>Pure 模式: </Text>
            <Switch checked={isPureMode} onChange={setIsPureMode} checkedChildren="开启" unCheckedChildren="关闭" />
          </div>
          <div>
            <Text strong>对比模式: </Text>
            <Switch checked={showComparison} onChange={setShowComparison} checkedChildren="开启" unCheckedChildren="关闭" />
          </div>
        </Space>
      </Card>

      {showComparison ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {[{ title: '普通模式', pure: false, prefix: 'normal-' }, { title: 'Pure 模式', pure: true, prefix: 'pure-' }].map(({ title, pure, prefix }) => (
            <Card key={title} title={title} size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {mockMessages.slice(0, 2).map((msg) => renderBubble(msg, pure, prefix))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <BubbleDemoCard title={`${isPureMode ? '✨ Pure' : '🎯 普通'}模式展示`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
            {mockMessages.map((msg) => renderBubble(msg, isPureMode))}
          </div>
        </BubbleDemoCard>
      )}
    </div>
  );
};
