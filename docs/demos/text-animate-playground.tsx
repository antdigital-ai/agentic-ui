import { TextAnimate } from '@ant-design/agentic-ui';
import {
  Button,
  Card,
  Divider,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
} from 'antd';
import React, { useState } from 'react';

const ANIMATIONS = [
  'fadeIn',
  'blurIn',
  'blurInUp',
  'blurInDown',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'scaleUp',
  'scaleDown',
] as const;

const BY_OPTIONS = ['text', 'word', 'character', 'line', 'mix'] as const;

const AS_OPTIONS = ['p', 'h1', 'h2', 'h3', 'div', 'span'] as const;

const SAMPLE = '智能体正在为你介绍这个组件，每个字 / 词都会依次入场。';
const MULTI_LINE = `第一行：用户提出问题。
第二行：智能体开始思考。
第三行：智能体给出答案。`;

export default () => {
  const [by, setBy] = useState<(typeof BY_OPTIONS)[number]>('word');
  const [animation, setAnimation] =
    useState<(typeof ANIMATIONS)[number]>('fadeIn');
  const [as, setAs] = useState<(typeof AS_OPTIONS)[number]>('p');
  const [duration, setDuration] = useState(0.3);
  const [delay, setDelay] = useState(0);
  const [startOnView, setStartOnView] = useState(true);
  const [once, setOnce] = useState(false);
  const [accessible, setAccessible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Card title="1. 配置面板" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap size="large">
            <Space>
              <span>by</span>
              <Select
                value={by}
                onChange={setBy}
                style={{ width: 140 }}
                options={BY_OPTIONS.map((v) => ({ label: v, value: v }))}
              />
            </Space>
            <Space>
              <span>animation</span>
              <Select
                value={animation}
                onChange={setAnimation}
                style={{ width: 160 }}
                options={ANIMATIONS.map((v) => ({ label: v, value: v }))}
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

          <Space wrap size="large">
            <Space>
              <span>duration (s)</span>
              <InputNumber
                min={0.1}
                max={2}
                step={0.1}
                value={duration}
                onChange={(v) => setDuration(v ?? 0.3)}
              />
            </Space>
            <Space>
              <span>delay (s)</span>
              <InputNumber
                min={0}
                max={5}
                step={0.1}
                value={delay}
                onChange={(v) => setDelay(v ?? 0)}
              />
            </Space>
            <Space>
              <span>startOnView</span>
              <Switch checked={startOnView} onChange={setStartOnView} />
            </Space>
            <Space>
              <span>once</span>
              <Switch checked={once} onChange={setOnce} />
            </Space>
            <Space>
              <span>accessible</span>
              <Switch checked={accessible} onChange={setAccessible} />
            </Space>
          </Space>

          <Space>
            <Button type="primary" onClick={() => setReplayKey((k) => k + 1)}>
              重新播放动画
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="2. 实时预览" size="small">
        <div
          key={replayKey}
          style={{
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: 24,
            background: '#fafafa',
            minHeight: 120,
          }}
        >
          <TextAnimate
            as={as}
            by={by}
            animation={animation}
            duration={duration}
            delay={delay}
            startOnView={startOnView}
            once={once}
            accessible={accessible}
            style={{ fontSize: 20, margin: 0 }}
          >
            {by === 'line' ? MULTI_LINE : SAMPLE}
          </TextAnimate>
        </div>
      </Card>

      <Card title="3. 全部 animation 预设" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {ANIMATIONS.map((a) => (
            <div
              key={`${a}-${replayKey}`}
              style={{
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: 8,
              }}
            >
              <Tag color="blue" style={{ marginBottom: 4 }}>
                {a}
              </Tag>
              <TextAnimate
                as="p"
                by="word"
                animation={a}
                style={{ fontSize: 16, margin: 0 }}
              >
                {SAMPLE}
              </TextAnimate>
            </div>
          ))}
        </Space>
      </Card>

      <Card title="4. 不同 by 拆分模式" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {BY_OPTIONS.map((b) => (
            <div key={`${b}-${replayKey}`}>
              <Tag color="green" style={{ marginBottom: 4 }}>
                {b}
              </Tag>
              <TextAnimate
                as="p"
                by={b}
                animation="fadeIn"
                style={{
                  fontSize: 16,
                  margin: 0,
                  whiteSpace: b === 'line' ? 'pre-line' : undefined,
                }}
              >
                {b === 'line' ? MULTI_LINE : SAMPLE}
              </TextAnimate>
            </div>
          ))}
        </Space>
      </Card>

      <Divider style={{ margin: 0 }} />
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        提示：startOnView 默认
        true，元素出现在视口才会触发动画；点击「重新播放动画」会重新挂载组件。
      </div>
    </div>
  );
};
