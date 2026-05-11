import type { MarkdownRendererRef } from '@ant-design/agentic-ui';
import { MarkdownRenderer } from '@ant-design/agentic-ui';
import {
  Button,
  Divider,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const SECTION_STYLE: React.CSSProperties = {
  border: '1px solid #f0f0f0',
  borderRadius: 8,
  padding: 16,
  background: '#fff',
};

const FULL_CONTENT = `# 流式 Markdown · API Playground

智能体正在为你演示 \`MarkdownRenderer\` 各项参数的协同效果。下面是一段示例正文：

- 列表项 1，包含 **粗体** 与 _斜体_
- 列表项 2，包含 \`内联代码\` 与 [跳转链接](https://example.com)
- 列表项 3，验证 [eleRender 自定义渲染](#custom-render)

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> 引用段落 · 用于验证流式末段淡入是否随段落出现。

| 名称 | 含义 |
| --- | --- |
| streaming | 是否流式 |
| isFinished | 是否完成 |
| streamingParagraphAnimation | 末段淡入开关 |

\`\`\`mermaid
graph LR
  user((User)) --> agent[Agent]
  agent --> tool[(Tool)]
  agent --> answer[Answer]
\`\`\`
`;

const PRESET_CONTENT: Record<'doc' | 'mermaid' | 'code-only', string> = {
  doc: FULL_CONTENT,
  mermaid:
    '# Mermaid 代码块\n\n下面的代码块将被路由到 `MermaidBlockRenderer`：\n\n```mermaid\nsequenceDiagram\n  participant U as User\n  participant A as Agent\n  participant T as Tool\n  U->>A: 提问\n  A->>T: 调用工具\n  T-->>A: 结果\n  A-->>U: 答复\n```\n',
  'code-only':
    '# 代码块演示\n\n```ts\ninterface Props {\n  content: string;\n  streaming?: boolean;\n}\n\nexport const Demo = (p: Props) => p.content;\n```\n\n```python\ndef greet(name: str) -> str:\n    return f"Hello, {name}!"\n```\n',
};

export default () => {
  const [preset, setPreset] = useState<keyof typeof PRESET_CONTENT>('doc');
  const fullContent = PRESET_CONTENT[preset];

  const [streaming, setStreaming] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [streamingParagraphAnimation, setStreamingParagraphAnimation] =
    useState(true);

  const [charsPerFrame, setCharsPerFrame] = useState(4);
  const [speed, setSpeed] = useState(1);
  const [animateTailChars, setAnimateTailChars] = useState<number | null>(null);

  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [interceptLink, setInterceptLink] = useState(false);

  const [enableCustomRender, setEnableCustomRender] = useState(false);

  const [content, setContent] = useState('');
  const indexRef = useRef(0);
  const rendererRef = useRef<MarkdownRendererRef>(null);

  useEffect(() => {
    indexRef.current = 0;
    setContent('');
    setIsFinished(false);
    setStreaming(true);
  }, [preset]);

  useEffect(() => {
    if (!streaming) return;
    const timer = setInterval(() => {
      indexRef.current += 6;
      const next = fullContent.slice(0, indexRef.current);
      setContent(next);
      if (indexRef.current >= fullContent.length) {
        setIsFinished(true);
        setStreaming(false);
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [streaming, fullContent]);

  const handleReplay = () => {
    indexRef.current = 0;
    setContent('');
    setIsFinished(false);
    setStreaming(true);
  };

  const handleSnapshot = () => {
    const displayed = rendererRef.current?.getDisplayedContent();
    message.info(`当前已渲染 ${displayed?.length ?? 0} 字符（含动画推进进度）`);
  };

  const queueOptions = useMemo(
    () => ({
      charsPerFrame,
      speed,
      animate: true,
      animateTailChars: animateTailChars ?? undefined,
    }),
    [charsPerFrame, speed, animateTailChars],
  );

  const linkConfig = useMemo(
    () => ({
      openInNewTab,
      onClick: interceptLink
        ? (url?: string) => {
            message.warning(`已拦截链接跳转：${url}`);
            return false;
          }
        : undefined,
    }),
    [openInNewTab, interceptLink],
  );

  const eleRender = useMemo(() => {
    if (!enableCustomRender) return undefined;
    return (props: any, defaultDom: React.ReactNode) => {
      if (props.tagName === 'h1') {
        return (
          <h1
            style={{
              background: 'linear-gradient(90deg, #1677ff 0%, #722ed1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 12px',
            }}
          >
            ✨ {props.children}
          </h1>
        );
      }
      return defaultDom;
    };
  }, [enableCustomRender]);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Typography.Title level={4} style={{ margin: 0 }}>
        MarkdownRenderer · API Playground
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        通过下面的控制面板可以串联调试 MarkdownRenderer 的核心
        API：流式控制、字符队列、链接行为、自定义渲染、命令式 ref。
      </Typography.Paragraph>

      <div style={SECTION_STYLE}>
        <Typography.Text strong>1. 内容预设</Typography.Text>
        <Divider style={{ margin: '8px 0' }} />
        <Space wrap>
          <Select
            value={preset}
            onChange={setPreset}
            style={{ width: 200 }}
            options={[
              { label: '综合文档', value: 'doc' },
              { label: 'Mermaid 流程图', value: 'mermaid' },
              { label: '纯代码块', value: 'code-only' },
            ]}
          />
          <Tag color="blue">{`${content.length}/${fullContent.length}`}</Tag>
          <Tag color={streaming ? 'processing' : 'success'}>
            {streaming ? '流式中' : '已完成'}
          </Tag>
          <Button onClick={handleReplay} disabled={streaming}>
            重新播放
          </Button>
          <Button onClick={handleSnapshot}>读取已渲染内容（ref）</Button>
        </Space>
      </div>

      <div style={SECTION_STYLE}>
        <Typography.Text strong>2. 流式开关</Typography.Text>
        <Divider style={{ margin: '8px 0' }} />
        <Space size="large" wrap>
          <Space>
            <span>streaming</span>
            <Switch checked={streaming} onChange={setStreaming} />
          </Space>
          <Space>
            <span>isFinished</span>
            <Switch checked={isFinished} onChange={setIsFinished} />
          </Space>
          <Space>
            <span>streamingParagraphAnimation</span>
            <Switch
              checked={streamingParagraphAnimation}
              onChange={setStreamingParagraphAnimation}
            />
          </Space>
        </Space>
      </div>

      <div style={SECTION_STYLE}>
        <Typography.Text strong>3. queueOptions 字符队列</Typography.Text>
        <Divider style={{ margin: '8px 0' }} />
        <Space size="large" wrap>
          <Space>
            <span>charsPerFrame</span>
            <InputNumber
              min={1}
              max={20}
              value={charsPerFrame}
              onChange={(v) => setCharsPerFrame(v ?? 1)}
            />
          </Space>
          <Space>
            <span>speed</span>
            <InputNumber
              min={0.1}
              max={5}
              step={0.1}
              value={speed}
              onChange={(v) => setSpeed(v ?? 1)}
            />
          </Space>
          <Space>
            <span>animateTailChars</span>
            <InputNumber
              min={0}
              max={500}
              value={animateTailChars ?? undefined}
              placeholder="不限制"
              onChange={(v) => setAnimateTailChars(v ?? null)}
            />
          </Space>
        </Space>
      </div>

      <div style={SECTION_STYLE}>
        <Typography.Text strong>4. linkConfig 链接行为</Typography.Text>
        <Divider style={{ margin: '8px 0' }} />
        <Space size="large" wrap>
          <Space>
            <span>openInNewTab</span>
            <Switch checked={openInNewTab} onChange={setOpenInNewTab} />
          </Space>
          <Space>
            <span>onClick 拦截跳转</span>
            <Switch checked={interceptLink} onChange={setInterceptLink} />
          </Space>
        </Space>
      </div>

      <div style={SECTION_STYLE}>
        <Typography.Text strong>5. eleRender 自定义渲染</Typography.Text>
        <Divider style={{ margin: '8px 0' }} />
        <Space size="large" wrap>
          <Space>
            <span>对 h1 应用渐变标题</span>
            <Switch
              checked={enableCustomRender}
              onChange={setEnableCustomRender}
            />
          </Space>
        </Space>
      </div>

      <div
        style={{
          ...SECTION_STYLE,
          minHeight: 320,
          background: '#fafafa',
        }}
      >
        <MarkdownRenderer
          ref={rendererRef}
          content={content}
          streaming={streaming}
          isFinished={isFinished}
          streamingParagraphAnimation={streamingParagraphAnimation}
          queueOptions={queueOptions}
          linkConfig={linkConfig}
          eleRender={eleRender}
        />
      </div>
    </div>
  );
};
