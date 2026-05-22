/* eslint-disable @typescript-eslint/no-loop-func */
import {
  BubbleList,
  MessageBubbleData,
  type ContentThrottleOptions,
} from '@ant-design/agentic-ui';
import {
  ClearOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, InputNumber, Radio, Space, Switch } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_CHARS_PER_FRAME = 3;
const DEFAULT_THROTTLE_SPEED = 1;
const CHARS_PER_FRAME_MIN = 1;
const CHARS_PER_FRAME_MAX = 50;
const THROTTLE_SPEED_MIN = 0.25;
const THROTTLE_SPEED_MAX = 4;

const rerenderDemoMarkdown = `<think>
我们注意到用户上传了两个附件，并要求调用文件理解工具总结两个文档内容。
 根据工具列表，我们有file_reader工具可以用于读取文档内容。由于用户要求总结两个文档，我们需要分别调用两次file_reader工具。
 但是，工具调用格式要求一次只能调用一个工具，因此我们需要分别调用两次，每次处理一个文件。

 然而，由于用户要求同时总结两个文档，我们可能需要先调用第一个文件，再调用第二个文件。但注意，我们的回复中只能包含一次工具调用（因为格式要求一次只能调用一个工具？）。但实际上，我们可以连续两次调用工具吗？

 观察工具调用格式说明，它要求我们使用以下格式：
 \`\`\`
 [
   {
     "name": "function_name",
     "arguments": {...}
   }
 ]
 \`\`\`

 但实际上，我们可以在一个回复中连续调用多个工具吗？根据格式说明，它似乎允许在一个回复中调用多个工具，但格式要求是数组形式。

 但是，我们目前的回复格式要求是：当我们调用工具时，必须使用指定的格式，且整个回复只包含工具调用。

 因此，我们可以这样设计：
 在同一个回复中，连续调用两个file_reader工具。将两个工具调用放在一个数组中。

 但是，请注意：工具调用格式要求是使用一个数组，数组的每个元素是一个工具调用对象。

 因此，我们可以这样写：
\`\`\`json
[
  {
    "name": "file_reader",
    "arguments": {
      "file_url": "https://agents.ccic-net.com.cn/file/download/agent/attach/default/67c72361d9ba4242bb5ce37a29ba4b50?fileKey=%E6%B5%8B%E8%AF%95%E5%9B%BE%E7%89%87%E8%AF%86%E5%88%AB-8bfdacba-daa5-482a-a677-a98de2d0eee5.docx",
      "file_type": "docx"
    }
  },
  {
    "name": "file_reader",
    "arguments": {
      "file_url": "https://agents.ccic-net.com.cn/file/download/agent/attach/default/c9753c0da9e6481d8c0a1dca340b0147?fileKey=%E5%85%AC%E5%85%B1%E4%BD%93%E9%AA%8C%E7%A9%BA%E9%97%B4%E7%94%A8%E6%88%B7%E5%8F%8D%E9%A6%88%E6%95%B0%E6%8D%AE%E9%97%AE%E9%A2%98-1009ec59-c1ec-4482-a155-d955eb0b36df.docx",
      "file_type": "docx"
    }
  }
]
\`\`\`

 但是，请注意：工具调用的格式说明中并没有明确说明是否可以一次调用多个工具。然而，根据示例，每次调用一个工具，但如果我们一次调用多个，可能也是允许的。

 不过，为了安全起见，我们也可以分两次回复，每次调用一个工具。但是，用户要求我们总结两个文档，我们希望在一个回复中完成两个文件的总结请求。

 然而，实际上，我们无法在一个回复中同时返回两个文件的内容总结，因为工具调用后，工具会返回结果，然后我们才能根据结果进行总结。所以，我们需要先调用工具获取文件内容，然后才能总结。

 因此，我们只能先调用工具，然后等待工具返回结果，再在后续的回复中总结。所以，我们无法在一个回复中同时完成两个文件的总结。

 但是，我们可以先同时调用两个文件读取工具，这样工具会同时处理两个文件，然后返回两个结果。然后我们在后续的回复中再总结两个文档。

 所以，我们决定在一个回复中同时调用两个file_reader工具。

 注意：在调用工具时，我们不需要content_id，因为参数说明中content_id是可选的。我们只需要file_url和file_type。

 因此，我们按照上述格式调用两个工具。</think>
<thinking>
用户上传了两个docx文件，要求调用文件理解工具总结两个文档的内容。根据用户的历史记录，用户之前也要求总结文档内容，可能是在进行某种文档分析工作。

我需要使用file_reader工具分别读取这两个文件。工具要求提供file_url和file_type参数，content_id是可选的。两个文件都是docx格式，URL已经提供。

由于用户要求同时总结两个文档，我会在同一个工具调用中处理两个文件。但工具设计似乎一次只能处理一个文件，所以需要分别调用两次。

考虑到用户可能希望获得两个文档的独立总结，我会分别处理每个文件，然后在下一次回复中提供两个文档的总结内容。
</thinking>


\`\`\`json
[
  {
    "name": "file_reader",
    "arguments": {
      "file_url": "https://agents.ccic-net.com.cn/file/download/agent/attach/default/67c72361d9ba4242bb5ce37a29ba4b50?fileKey=%E6%B5%8B%E8%AF%95%E5%9B%BE%E7%89%87%E8%AF%86%E5%88%AB-8bfdacba-daa5-482a-a677-a98de2d0eee5.docx",
      "file_type": "docx"
    }
  },
  {
    "name": "file_reader",
    "arguments": {
      "file_url": "https://agents.ccic-net.com.cn/file/download/agent/attach/default/c9753c0da9e6481d8c0a1dca340b0147?fileKey=%E5%85%AC%E5%85%B1%E4%BD%93%E9%AA%8C%E7%A9%BA%E9%97%B4%E7%94%A8%E6%88%B7%E5%8F%8D%E9%A6%88%E6%95%B0%E6%8D%AE%E9%97%AE%E9%A2%98-1009ec59-c1ec-4482-a155-d955eb0b36df.docx",
      "file_type": "docx"
    }
  }
]
\`\`\``;

/** 非空占位，避免 isFinished=false 且 content 为空时走「思考中」骨架而非 Markdown */
const STREAM_PLACEHOLDER = '\u200b';

type SpeedType = 'block' | 'fast' | 'medium' | 'slow';

const splitBlocks = (text: string): string[] => {
  const blocks: string[] = [];
  let current = '';
  let inFence = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      line.trimStart().startsWith('\`\`\`') ||
      line.trimStart().startsWith('~~~')
    ) {
      inFence = !inFence;
    }
    current += (current ? '\n' : '') + line;
    if (
      !inFence &&
      line === '' &&
      i + 1 < lines.length &&
      lines[i + 1] === ''
    ) {
      continue;
    }
    if (!inFence && line === '' && current.trim()) {
      blocks.push(current);
      current = '';
    }
  }
  if (current) blocks.push(current);
  return blocks;
};

const createInitialMessage = (): MessageBubbleData => ({
  id: 'rerender-bubble-stream',
  role: 'assistant',
  content: STREAM_PLACEHOLDER,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: false,
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'MarkdownRenderer · Bubble',
    description: '流式演示',
  },
});

/** 与 docs/demos/rerender.tsx 同源流式逻辑，在 Bubble + renderMode: markdown 内展示。 */
const RerenderBubbleDemo = () => {
  const [message, setMessage] =
    useState<MessageBubbleData>(createInitialMessage);
  const [speed, setSpeed] = useState<SpeedType>('fast');
  const [throttleEnabled, setThrottleEnabled] = useState(true);
  const [charsPerFrame, setCharsPerFrame] = useState(DEFAULT_CHARS_PER_FRAME);
  const [throttleSpeed, setThrottleSpeed] = useState(DEFAULT_THROTTLE_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const currentIndexRef = useRef(0);
  const speedRef = useRef<SpeedType>('fast');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [restartKey, setRestartKey] = useState(0);

  const throttleOptions = useMemo<ContentThrottleOptions>(() => {
    if (!throttleEnabled) {
      return { enabled: false };
    }
    return {
      enabled: true,
      charsPerFrame,
      speed: throttleSpeed,
    };
  }, [throttleEnabled, charsPerFrame, throttleSpeed]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  const clearContent = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage((prev) => ({
      ...prev,
      content: STREAM_PLACEHOLDER,
      isFinished: false,
      updateAt: Date.now(),
    }));
    currentIndexRef.current = 0;
  };

  const restart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setMessage((prev) => ({
      ...prev,
      content: STREAM_PLACEHOLDER,
      isFinished: false,
      updateAt: Date.now(),
    }));
    currentIndexRef.current = 0;
    setIsPaused(false);
    pauseRef.current = false;
    setRestartKey((prev) => prev + 1);
  };

  useEffect(() => {
    const blocks = splitBlocks(rerenderDemoMarkdown);
    const chars = rerenderDemoMarkdown.split('');
    let md = '';
    currentIndexRef.current = 0;

    if (process.env.NODE_ENV === 'test') {
      setMessage((prev) => ({
        ...prev,
        content: rerenderDemoMarkdown,
        isFinished: true,
        updateAt: Date.now(),
      }));
      return;
    }

    const processNext = () => {
      const isBlock = speedRef.current === 'block';

      if (isBlock) {
        if (currentIndexRef.current >= blocks.length) {
          setMessage((prev) => ({
            ...prev,
            isFinished: true,
            updateAt: Date.now(),
          }));
          return;
        }
        if (pauseRef.current) {
          timeoutRef.current = setTimeout(processNext, 100);
          return;
        }
        md = blocks.slice(0, currentIndexRef.current + 1).join('\n');
        currentIndexRef.current += 1;
        timeoutRef.current = setTimeout(() => {
          setMessage((prev) => ({
            ...prev,
            content: md,
            isFinished: false,
            updateAt: Date.now(),
          }));
          processNext();
        }, 50);
      } else {
        if (currentIndexRef.current >= chars.length) {
          setMessage((prev) => ({
            ...prev,
            isFinished: true,
            updateAt: Date.now(),
          }));
          return;
        }
        if (pauseRef.current) {
          timeoutRef.current = setTimeout(processNext, 100);
          return;
        }
        md += chars[currentIndexRef.current];
        currentIndexRef.current += 1;
        const delay =
          speedRef.current === 'fast'
            ? 1
            : speedRef.current === 'medium'
              ? 16
              : 160;
        timeoutRef.current = setTimeout(() => {
          setMessage((prev) => ({
            ...prev,
            content: md,
            isFinished: false,
            updateAt: Date.now(),
          }));
          processNext();
        }, delay);
      }
    };

    processNext();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [restartKey]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        background: '#f5f5f5',
        boxSizing: 'border-box',
        minHeight: 480,
      }}
    >
      <div
        style={{
          padding: 12,
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Space wrap>
          <span>速度：</span>
          <Radio.Group
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="block">逐块</Radio.Button>
            <Radio.Button value="fast">快</Radio.Button>
            <Radio.Button value="medium">中</Radio.Button>
            <Radio.Button value="slow">慢</Radio.Button>
          </Radio.Group>
          <Button
            type="primary"
            icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '继续' : '暂停'}
          </Button>
          <Button icon={<ClearOutlined />} onClick={clearContent}>
            清空
          </Button>
          <Button type="primary" icon={<ReloadOutlined />} onClick={restart}>
            再来一次
          </Button>
        </Space>
        <Space wrap align="center">
          <span>流式限流：</span>
          <Switch
            checked={throttleEnabled}
            onChange={setThrottleEnabled}
            checkedChildren="开"
            unCheckedChildren="关"
          />
          {throttleEnabled && (
            <>
              <span>每帧字符</span>
              <InputNumber
                min={CHARS_PER_FRAME_MIN}
                max={CHARS_PER_FRAME_MAX}
                value={charsPerFrame}
                onChange={(v) =>
                  setCharsPerFrame(
                    typeof v === 'number' ? v : DEFAULT_CHARS_PER_FRAME,
                  )
                }
              />
              <span>速度倍率</span>
              <InputNumber
                min={THROTTLE_SPEED_MIN}
                max={THROTTLE_SPEED_MAX}
                step={0.25}
                value={throttleSpeed}
                onChange={(v) =>
                  setThrottleSpeed(
                    typeof v === 'number' ? v : DEFAULT_THROTTLE_SPEED,
                  )
                }
              />
            </>
          )}
        </Space>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
        <BubbleList
          bubbleList={[
            {
              id: 'rerender-bubble-stream',
              role: 'assistant',
              content:
                '下面模拟 **流式追加**：未完成前保持 `isFinished: false`，结束时再置为 `true` 以配合队列与动画策略。',
              createAt: Date.now(),
              updateAt: Date.now(),
              isFinished: false,
              meta: {
                avatar:
                  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
                title: 'MarkdownRenderer · Bubble',
                description: 'MarkdownRenderer · 流式',
              },
            },
            message,
          ]}
          markdownRenderConfig={{
            renderMode: 'markdown',
            throttleOptions,
          }}
          shouldShowCopy={false}
        />
      </div>

      <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 8px' }}>
          与「动态 render」演示相同：模拟流式追加 Markdown；此处通过{' '}
          <code>Bubble</code> +{' '}
          <code>markdownRenderConfig.renderMode: &apos;markdown&apos;</code>{' '}
          走轻量 <code>MarkdownRenderer</code>，无 Slate 实例。
        </p>
        <p style={{ margin: '0 0 8px' }}>
          流式进行中需保证 <code>originData.content</code>{' '}
          非空（此处用零宽占位），否则气泡会显示「思考中」加载态。
        </p>
        <p style={{ margin: '0 0 8px' }}>
          通过 <code>markdownRenderConfig.throttleOptions</code>{' '}
          配置流式限流：关闭（<code>enabled: false</code>
          ）时内容随 <code>originData.content</code> 即时渲染；开启后由{' '}
          <code>charsPerFrame</code>、<code>speed</code>{' '}
          控制每帧推进节奏（消息 <code>isFinished: false</code>{' '}
          时自动视为流式）。
        </p>
        <p style={{ margin: 0 }}>
          与 Slate 打字机动画不同；末段段落淡入由{' '}
          <code>streamingParagraphAnimation</code> 单独控制（未传时默认开启）。
        </p>
      </div>
    </div>
  );
};

export default RerenderBubbleDemo;
