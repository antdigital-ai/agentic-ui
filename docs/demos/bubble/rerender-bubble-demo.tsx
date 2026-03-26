/* eslint-disable @typescript-eslint/no-loop-func */
import { BubbleList, MessageBubbleData } from '@ant-design/agentic-ui';
import {
  ClearOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Radio, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { RERENDER_CARD_APPENDIX } from '../shared/rerenderCardAppendix';

const rerenderDemoMarkdown = `> 用户再次要求基于中国 10 年的 GDP 数据，用 markdown 语法绘制图表展示 2020-2026 年 GDP 增长情况。这个请求我已经回答过很多次了，我应该提供一致的回复。





## 📊 中国 2020-2026 年 GDP 增长情况

### 📋 数据表格

| 年份 | GDP（万亿元） | 增长率 | 数据性质 |
|:----:|:-------------:|:------:|:--------:|
| 2020 | 101.6 | 2.2% | 实际值 |
| 2021 | 114.9 | 8.4% | 实际值 |
| 2022 | 121.0 | 3.0% | 实际值 |
| 2023 | 126.1 | 5.2% | 实际值 |
| 2024 | 134.9 | 5.0% | 初步核算 |
| 2025 | 141.6 | 5.0% | 预测值 |
| 2026 | 148.7 | 5.0% | 预测值 |

---

### 📈 GDP 总量趋势图

\`\`\`mermaid
xychart-beta
    title "中国 GDP 增长趋势 (2020-2026)"
    x-axis [2020, 2021, 2022, 2023, 2024, 2025, 2026]
    y-axis "GDP (万亿元)" 90 --> 160
    bar [101.6, 114.9, 121.0, 126.1, 134.9, 141.6, 148.7]
    line [101.6, 114.9, 121.0, 126.1, 134.9, 141.6, 148.7]
\`\`\`

---

### 📉 同比增长率走势

\`\`\`mermaid
xychart-beta
    title "中国 GDP 同比增长率 (2020-2026)"
    x-axis [2020, 2021, 2022, 2023, 2024, 2025, 2026]
    y-axis "增长率 (%)" 0 --> 10
    line [2.2, 8.4, 3.0, 5.2, 5.0, 5.0, 5.0]
    area [2.2, 8.4, 3.0, 5.2, 5.0, 5.0, 5.0]
\`\`\`

---

### 💡 趋势解读

| 时期 | 特征 | 关键因素 |
|:----:|:----:|:---------|
| 2020 | 📉 低谷 | 新冠疫情冲击，增速降至 2.2% |
| 2021 | 🚀 反弹 | 疫后复苏 + 出口拉动，增速 8.4% |
| 2022 | 📉 放缓 | 疫情反复 + 房地产调整 |
| 2023-2026 | ➡️ 稳健 | 高质量发展阶段，目标增速 5% 左右 |

> 📌 **说明**：2020-2024 年为实际数据，2025-2026 年为预测值。数据来源：中国国家统计局、IMF。${RERENDER_CARD_APPENDIX.trim()}`;

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
      line.trimStart().startsWith('```') ||
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
  const [isPaused, setIsPaused] = useState(false);
  const pauseRef = useRef(false);
  const currentIndexRef = useRef(0);
  const speedRef = useRef<SpeedType>('fast');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [restartKey, setRestartKey] = useState(0);

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
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
        <BubbleList
          bubbleList={[
            {
              id: 'rerender-bubble-stream',
              role: 'assistant',
              content: '流式演示一下',
              createAt: Date.now(),
              updateAt: Date.now(),
              isFinished: false,
              meta: {
                avatar:
                  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
                title: 'MarkdownRenderer · Bubble',
                description: '流式演示',
              },
            },
            message,
          ]}
          markdownRenderConfig={{
            renderMode: 'markdown',
            queueOptions: { animate: false },
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
        <p style={{ margin: 0 }}>
          流式进行中需保证 <code>originData.content</code>{' '}
          非空（此处用零宽占位），否则气泡会显示「思考中」加载态。
        </p>
      </div>
    </div>
  );
};

export default RerenderBubbleDemo;
