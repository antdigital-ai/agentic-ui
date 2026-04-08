import {
  Bubble,
  MessageBubbleData,
  SuggestionList,
} from '@ant-design/agentic-ui';
import { message } from 'antd';
import React, { useRef, useState } from 'react';
import { BubbleDemoCard } from './bubble/BubbleDemoCard';

const initAssistant: MessageBubbleData = {
  id: 'a-1',
  role: 'assistant',
  content: `# 在对话里使用 Markdown

我是示例助手，可配合下方 **SuggestionList** 演示快捷追问。你可以：

- **问 API** — \`Bubble\` / \`MarkdownEditor\` 等 props 与典型用法
- **贴代码** — 组件集成、主题与 \`markdownRenderConfig\`
- **要步骤** — 从安装到页面里接入 \`ChatLayout\` + \`BubbleList\`

直接点选推荐问题，或在输入框里继续输入。`,
  extra: {},
  createAt: Date.now() - 10000,
  updateAt: Date.now() - 10000,
  isFinished: true,
  isAborted: false,
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'AI 助手',
    description: 'AI 助手',
  },
};

const items = [
  {
    key: 'footnote-markdown',
    icon: '🔗',
    text: '脚注与引用在 Bubble / Markdown 里怎么配？',
  },
  {
    key: 'streaming-bubble',
    icon: '⚡',
    text: '流式 Markdown 和 BubbleList 如何一起用？',
  },
  {
    key: 'chat-layout-setup',
    icon: '🧩',
    text: 'ChatLayout + BubbleList 最小接入步骤',
  },
];

export default function SuggestionListBasicDemo() {
  const bubbleRef = useRef<any>();
  const [list] = useState<MessageBubbleData[]>([initAssistant]);

  const handleAsk = async (text: string) => {
    message.info(`${text}`);
  };

  return (
    <BubbleDemoCard
      title="💬 建议列表组件 SuggestionList"
      description="在气泡下方渲染建议列表"
    >
      <div style={{ padding: 24 }}>
        {list.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginBottom: 4,
            }}
          >
            <Bubble
              bubbleRef={bubbleRef}
              avatar={m.meta!}
              originData={m}
              pure
              markdownRenderConfig={{
                tableConfig: {
                  pure: true,
                },
              }}
              placement={m.role === 'user' ? 'right' : 'left'}
              style={{ marginBottom: 4 }}
              onLike={async (data) => {
                console.log('点赞:', data);
              }}
              onDisLike={async (data) => {
                console.log('点踩:', data);
              }}
              onReply={(content) => {
                console.log('回复:', content);
              }}
            />
            <div>基础版本示例</div>
            {m.id === initAssistant.id ? (
              <div
                style={{
                  marginTop: 0,
                  marginLeft: 10,
                  width: 'fit-content',
                }}
              >
                <SuggestionList
                  items={items}
                  onItemClick={handleAsk}
                  type="basic"
                />
              </div>
            ) : null}
            <div>透明版本示例</div>
            {m.role === 'assistant' && m.id === 'a-1' ? (
              <div
                style={{
                  marginLeft: 10,
                }}
              >
                <SuggestionList
                  type="transparent"
                  maxItems={4}
                  items={items}
                  onItemClick={handleAsk}
                />
              </div>
            ) : null}
            <div>白色版本示例</div>
            {m.role === 'assistant' && m.id === 'a-1' ? (
              <div
                style={{
                  marginLeft: 10,
                }}
              >
                <SuggestionList
                  type="white"
                  maxItems={4}
                  items={items}
                  onItemClick={handleAsk}
                />
              </div>
            ) : null}
            <div>搜索更多示例</div>
            {m.id === initAssistant.id ? (
              <div
                style={{
                  marginLeft: 10,
                  width: 'fit-content',
                }}
              >
                <SuggestionList
                  items={items}
                  onItemClick={handleAsk}
                  type="basic"
                  showMore={{
                    enable: true,
                    onClick: () => message.info('点击了：搜索更多'),
                  }}
                />
              </div>
            ) : null}
            <div>横向布局示例</div>
            {m.role === 'assistant' && m.id === 'a-1' ? (
              <div
                style={{
                  marginLeft: 10,
                }}
              >
                <SuggestionList
                  layout="horizontal"
                  maxItems={4}
                  items={items}
                  onItemClick={handleAsk}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </BubbleDemoCard>
  );
}
