import {
  MarkdownRenderer,
  type ContentThrottleOptions,
} from '@ant-design/agentic-ui';
import {
  Button,
  Card,
  Divider,
  InputNumber,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const PREVIEW_STYLE: React.CSSProperties = {
  border: '1px dashed #d9d9d9',
  borderRadius: 8,
  padding: 16,
  background: '#fafafa',
  minHeight: 280,
};

const FULL_CONTENT = `# 流式 Markdown 演示

智能体正在逐步给出答案。开启 **逐词淡入** 后，新出现的文字会像 GPT 一样平滑淡入；已显示的内容保持稳定、不闪烁。

## 特性说明

- **逐词淡入**：纯 CSS 驱动，性能友好，自动尊重 \`prefers-reduced-motion\`
- **内容限流**：\`throttleOptions\` 控制每帧推进字符数，避免一次性突变
- **安全区域**：代码块、表格、公式不参与拆词，避免破坏布局

下面包含 **粗体**、\`内联代码\` 与代码块：

- 列表项 1：每个词在出现时各自淡入一次
- 列表项 2：限流逐字推进，配合淡入形成连续的出字节奏
- 列表项 3：关闭淡入后内容即时显示，便于对比

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

| 选项 | 含义 |
| --- | --- |
| \`streaming\` | 启用流式 token 缓存，避免半截语法误解析 |
| \`throttleOptions.fade\` | GPT 风格逐词淡入，默认 \`true\` |

> 提示：流式过程中内容随 SSE 即时更新渲染；关闭 \`fade\` 后仍保留限流节奏，仅去掉淡入动画。
`;

const DEFAULT_CHARS_PER_FRAME = 3;
const DEFAULT_SPEED = 1;
const TICK_MS = 80;
const CHARS_PER_SLICE = 6;

export default () => {
  const [content, setContent] = useState('');
  const [running, setRunning] = useState(true);
  const [fade, setFade] = useState(true);
  const [throttleEnabled, setThrottleEnabled] = useState(true);
  const [charsPerFrame, setCharsPerFrame] = useState(DEFAULT_CHARS_PER_FRAME);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [compareMode, setCompareMode] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      indexRef.current += CHARS_PER_SLICE;
      const next = FULL_CONTENT.slice(0, indexRef.current);
      setContent(next);
      if (indexRef.current >= FULL_CONTENT.length) {
        setRunning(false);
        clearInterval(timer);
      }
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [running]);

  const throttleOptions = useMemo<ContentThrottleOptions>(() => {
    if (!throttleEnabled) {
      return { enabled: false, fade };
    }
    return {
      enabled: true,
      charsPerFrame,
      speed,
      fade,
    };
  }, [throttleEnabled, fade, charsPerFrame, speed]);

  const compareThrottleOn = useMemo<ContentThrottleOptions>(
    () => ({
      enabled: throttleEnabled,
      charsPerFrame,
      speed,
      fade: true,
    }),
    [throttleEnabled, charsPerFrame, speed],
  );

  const compareThrottleOff = useMemo<ContentThrottleOptions>(
    () => ({
      enabled: throttleEnabled,
      charsPerFrame,
      speed,
      fade: false,
    }),
    [throttleEnabled, charsPerFrame, speed],
  );

  const handleReplay = () => {
    indexRef.current = 0;
    setContent('');
    setRunning(true);
  };

  const progressTag = (
    <Tag color="blue">{`${content.length}/${FULL_CONTENT.length}`}</Tag>
  );
  const statusTag = (
    <Tag color={running ? 'processing' : 'success'}>
      {running ? '流式中' : '已完成'}
    </Tag>
  );

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
        流式 Markdown · GPT 风格逐词淡入
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        模拟 LLM 流式输出，调试{' '}
        <Typography.Text code>streaming</Typography.Text> 与{' '}
        <Typography.Text code>throttleOptions</Typography.Text>{' '}
        的协同效果。淡入仅作用于 Markdown
        渲染路径的正文文本，代码块与表格不参与拆词。
      </Typography.Paragraph>

      <Card title="1. 配置面板" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap size="large">
            <Button type="primary" onClick={handleReplay} disabled={running}>
              重新播放
            </Button>
            {progressTag}
            {statusTag}
          </Space>

          <Divider style={{ margin: 0 }} />

          <Space wrap size="large">
            <Space>
              <span>逐词淡入 fade</span>
              <Switch checked={fade} onChange={setFade} size="small" />
            </Space>
            <Space>
              <span>内容限流 enabled</span>
              <Switch
                checked={throttleEnabled}
                onChange={setThrottleEnabled}
                size="small"
              />
            </Space>
            <Space>
              <span>对比模式</span>
              <Switch
                checked={compareMode}
                onChange={setCompareMode}
                size="small"
              />
            </Space>
          </Space>

          <Space wrap size="large">
            <Space>
              <span>charsPerFrame</span>
              <InputNumber
                min={1}
                max={20}
                value={charsPerFrame}
                disabled={!throttleEnabled}
                onChange={(v) => setCharsPerFrame(v ?? DEFAULT_CHARS_PER_FRAME)}
              />
            </Space>
            <Space>
              <span>speed</span>
              <InputNumber
                min={0.25}
                max={4}
                step={0.25}
                value={speed}
                disabled={!throttleEnabled}
                onChange={(v) => setSpeed(v ?? DEFAULT_SPEED)}
              />
            </Space>
          </Space>
        </Space>
      </Card>

      {compareMode ? (
        <Card title="2. 对比预览（fade: true vs false）" size="small">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            <div>
              <Tag color="green" style={{ marginBottom: 8 }}>
                fade: true（默认）
              </Tag>
              <div style={PREVIEW_STYLE}>
                <MarkdownRenderer
                  content={content}
                  streaming={running}
                  throttleOptions={compareThrottleOn}
                />
              </div>
            </div>
            <div>
              <Tag color="default" style={{ marginBottom: 8 }}>
                fade: false
              </Tag>
              <div style={PREVIEW_STYLE}>
                <MarkdownRenderer
                  content={content}
                  streaming={running}
                  throttleOptions={compareThrottleOff}
                />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="2. 实时预览" size="small">
          <div style={PREVIEW_STYLE}>
            <MarkdownRenderer
              content={content}
              streaming={running}
              throttleOptions={throttleOptions}
            />
          </div>
        </Card>
      )}

      <Divider style={{ margin: 0 }} />
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        提示：逐词淡入默认开启；传{' '}
        <Typography.Text code>
          throttleOptions={'{{ fade: false }}'}
        </Typography.Text>{' '}
        可关闭。限流与淡入相互独立——关闭限流后内容即时渲染，淡入开关仍生效。
      </div>
    </div>
  );
};
