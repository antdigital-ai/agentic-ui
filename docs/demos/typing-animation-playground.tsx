import { TypingAnimation } from '@ant-design/agentic-ui';
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
} from 'antd';
import React, { useState } from 'react';

const CURSOR_OPTIONS = ['line', 'block', 'underscore'] as const;
const AS_OPTIONS = ['span', 'div', 'p', 'h2', 'h3'] as const;

const DEFAULT_WORDS = [
  'Agentic UI',
  '让智能体协作更直观',
  'Build with Ant Design',
];

export default () => {
  const [text, setText] = useState('你好，我是你的 AI 助手 👋');
  const [wordsInput, setWordsInput] = useState(DEFAULT_WORDS.join('|'));
  const [useWords, setUseWords] = useState(false);
  const [as, setAs] = useState<(typeof AS_OPTIONS)[number]>('span');
  const [duration, setDuration] = useState(80);
  const [typeSpeed, setTypeSpeed] = useState<number | null>(null);
  const [deleteSpeed, setDeleteSpeed] = useState<number | null>(null);
  const [delay, setDelay] = useState(0);
  const [pauseDelay, setPauseDelay] = useState(1000);
  const [loop, setLoop] = useState(true);
  const [startOnView, setStartOnView] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [blinkCursor, setBlinkCursor] = useState(true);
  const [cursorStyle, setCursorStyle] =
    useState<(typeof CURSOR_OPTIONS)[number]>('line');
  const [replayKey, setReplayKey] = useState(0);

  const words = wordsInput
    .split('|')
    .map((w) => w.trim())
    .filter(Boolean);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Card title="1. 输入内容" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <span>使用 words 多句循环</span>
            <Switch checked={useWords} onChange={setUseWords} />
          </Space>

          {useWords ? (
            <Space>
              <span>words（用 | 分隔）</span>
              <Input
                value={wordsInput}
                onChange={(e) => setWordsInput(e.target.value)}
                style={{ width: 480 }}
              />
            </Space>
          ) : (
            <Space>
              <span>children</span>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ width: 480 }}
              />
            </Space>
          )}
        </Space>
      </Card>

      <Card title="2. 速度与节奏" size="small">
        <Space wrap size="large">
          <Space>
            <span>duration (ms)</span>
            <InputNumber
              min={10}
              max={1000}
              value={duration}
              onChange={(v) => setDuration(v ?? 80)}
            />
          </Space>
          <Space>
            <span>typeSpeed (ms)</span>
            <InputNumber
              min={10}
              max={1000}
              value={typeSpeed ?? undefined}
              placeholder="跟随 duration"
              onChange={(v) => setTypeSpeed(v ?? null)}
            />
          </Space>
          <Space>
            <span>deleteSpeed (ms)</span>
            <InputNumber
              min={10}
              max={1000}
              value={deleteSpeed ?? undefined}
              placeholder="typeSpeed/2"
              onChange={(v) => setDeleteSpeed(v ?? null)}
            />
          </Space>
          <Space>
            <span>delay (ms)</span>
            <InputNumber
              min={0}
              max={5000}
              value={delay}
              onChange={(v) => setDelay(v ?? 0)}
            />
          </Space>
          <Space>
            <span>pauseDelay (ms)</span>
            <InputNumber
              min={0}
              max={5000}
              value={pauseDelay}
              onChange={(v) => setPauseDelay(v ?? 1000)}
            />
          </Space>
        </Space>
      </Card>

      <Card title="3. 行为与样式" size="small">
        <Space wrap size="large">
          <Space>
            <span>loop</span>
            <Switch checked={loop} onChange={setLoop} />
          </Space>
          <Space>
            <span>startOnView</span>
            <Switch checked={startOnView} onChange={setStartOnView} />
          </Space>
          <Space>
            <span>showCursor</span>
            <Switch checked={showCursor} onChange={setShowCursor} />
          </Space>
          <Space>
            <span>blinkCursor</span>
            <Switch checked={blinkCursor} onChange={setBlinkCursor} />
          </Space>
          <Space>
            <span>cursorStyle</span>
            <Select
              value={cursorStyle}
              onChange={setCursorStyle}
              style={{ width: 140 }}
              options={CURSOR_OPTIONS.map((v) => ({ label: v, value: v }))}
            />
          </Space>
          <Space>
            <span>as</span>
            <Select
              value={as}
              onChange={setAs}
              style={{ width: 100 }}
              options={AS_OPTIONS.map((v) => ({ label: v, value: v }))}
            />
          </Space>
        </Space>
      </Card>

      <Card title="4. 实时预览" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button type="primary" onClick={() => setReplayKey((k) => k + 1)}>
            重新播放
          </Button>
          <div
            key={replayKey}
            style={{
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              padding: 24,
              background: '#fafafa',
              minHeight: 80,
              fontSize: 20,
            }}
          >
            {useWords ? (
              <TypingAnimation
                as={as}
                words={words}
                duration={duration}
                typeSpeed={typeSpeed ?? undefined}
                deleteSpeed={deleteSpeed ?? undefined}
                delay={delay}
                pauseDelay={pauseDelay}
                loop={loop}
                startOnView={startOnView}
                showCursor={showCursor}
                blinkCursor={blinkCursor}
                cursorStyle={cursorStyle}
              />
            ) : (
              <TypingAnimation
                as={as}
                duration={duration}
                typeSpeed={typeSpeed ?? undefined}
                deleteSpeed={deleteSpeed ?? undefined}
                delay={delay}
                pauseDelay={pauseDelay}
                loop={loop}
                startOnView={startOnView}
                showCursor={showCursor}
                blinkCursor={blinkCursor}
                cursorStyle={cursorStyle}
              >
                {text}
              </TypingAnimation>
            )}
          </div>
        </Space>
      </Card>

      <Card title="5. 三种光标样式并排" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {CURSOR_OPTIONS.map((c) => (
            <div key={`${c}-${replayKey}`}>
              <Tag color="blue" style={{ marginBottom: 4 }}>
                {c}
              </Tag>
              <div style={{ fontSize: 18 }}>
                <TypingAnimation
                  duration={60}
                  cursorStyle={c}
                  startOnView={false}
                >
                  cursorStyle = "{c}"
                </TypingAnimation>
              </div>
            </div>
          ))}
        </Space>
      </Card>

      <Divider style={{ margin: 0 }} />
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        提示：words 模式下 loop 决定是否在末尾循环；children
        模式下输入完成且非循环时光标会自动隐藏。
      </div>
    </div>
  );
};
