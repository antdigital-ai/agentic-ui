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
import { newEnergyFundContent } from '../shared/newEnergyFundContent';
import { RERENDER_CARD_APPENDIX } from '../shared/rerenderCardAppendix';

const DEFAULT_CHARS_PER_FRAME = 3;
const DEFAULT_THROTTLE_SPEED = 1;
const CHARS_PER_FRAME_MIN = 1;
const CHARS_PER_FRAME_MAX = 50;
const THROTTLE_SPEED_MIN = 0.25;
const THROTTLE_SPEED_MAX = 4;

/** 与 rerender.tsx 同源，覆盖标题/表格/图表/Mermaid/代码块/提示块/脚注/Agentic 嵌入块等 */
const rerenderDemoMarkdown = `${newEnergyFundContent}\n\n${RERENDER_CARD_APPENDIX.trim()}`;

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
                '下面模拟 **流式追加**（与动态 render 演示同源 Markdown）：含标题、图片、链接、思考/回答标签、表格、内置 chart、Mermaid、代码块、提示块、任务列表、脚注、`agentic-ui-task` / `agentic-ui-toolusebar` 与文末 `agentar-card`。',
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
          与「动态 render」演示共用{' '}
          <code>newEnergyFundContent</code> +{' '}
          <code>RERENDER_CARD_APPENDIX</code>
          ，流式过程中可观察多种 Markdown / Agentic 块在{' '}
          <code>Bubble</code> +{' '}
          <code>markdownRenderConfig.renderMode: &apos;markdown&apos;</code>{' '}
          下的渲染与限流表现（无 Slate 实例）。
        </p>
        <p style={{ margin: '0 0 8px' }}>
          流式进行中需保证 <code>originData.content</code>{' '}
          非空（此处用零宽占位），否则气泡会显示「思考中」加载态。
        </p>
        <p style={{ margin: '0 0 8px' }}>
          通过 <code>markdownRenderConfig.throttleOptions</code>{' '}
          配置流式限流：关闭（<code>enabled: false</code>
          ）时内容随 <code>originData.content</code> 即时渲染；开启后由{' '}
          <code>charsPerFrame</code>、<code>speed</code> 控制每帧推进节奏（消息{' '}
          <code>isFinished: false</code> 时自动视为流式）。
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
