import { GradientText } from '@ant-design/agentic-ui';
import { Card, Divider, Input, InputNumber, Slider, Space, Tag } from 'antd';
import React, { useMemo, useState } from 'react';

const PRESETS: { label: string; colors: string[] }[] = [
  {
    label: '默认（青蓝循环）',
    colors: ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'],
  },
  {
    label: '日落',
    colors: ['#ff6b6b', '#feca57', '#ff9ff3', '#ff6b6b'],
  },
  {
    label: '极光',
    colors: ['#22d3ee', '#a78bfa', '#34d399', '#22d3ee'],
  },
  {
    label: 'Ant Design 主色',
    colors: ['#1677ff', '#722ed1', '#13c2c2', '#1677ff'],
  },
  {
    label: '黑金',
    colors: ['#1a1a1a', '#facc15', '#fbbf24', '#1a1a1a'],
  },
];

const SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export default () => {
  const [presetIndex, setPresetIndex] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(8);
  const [fontSize, setFontSize] = useState(36);
  const [content, setContent] = useState('Agentic UI · 让协作更直观');

  const colors = PRESETS[presetIndex].colors;

  const colorTags = useMemo(
    () =>
      colors.map((c, i) => (
        <Tag
          key={`${c}-${i}`}
          style={{ background: c, color: '#fff', borderColor: c }}
        >
          {c}
        </Tag>
      )),
    [colors],
  );

  return (
    <div style={{ padding: 24, ...SECTION_STYLE }}>
      <Card title="1. 配置面板" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <span>渐变预设：</span>
            {PRESETS.map((p, i) => (
              <Tag.CheckableTag
                key={p.label}
                checked={presetIndex === i}
                onChange={() => setPresetIndex(i)}
              >
                {p.label}
              </Tag.CheckableTag>
            ))}
          </Space>

          <Space wrap size="large">
            <Space>
              <span style={{ minWidth: 120 }}>animationSpeed (s)</span>
              <Slider
                min={1}
                max={30}
                value={animationSpeed}
                onChange={setAnimationSpeed}
                style={{ width: 200 }}
              />
              <InputNumber
                min={1}
                max={9999}
                value={animationSpeed}
                onChange={(v) => setAnimationSpeed(v ?? 8)}
              />
            </Space>

            <Space>
              <span>fontSize</span>
              <InputNumber
                min={12}
                max={96}
                value={fontSize}
                onChange={(v) => setFontSize(v ?? 36)}
                addonAfter="px"
              />
            </Space>
          </Space>

          <Space>
            <span>文本内容：</span>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: 360 }}
            />
          </Space>

          <Space wrap>
            <span>当前 colors：</span>
            {colorTags}
          </Space>
        </Space>
      </Card>

      <Card title="2. 实时预览" size="small">
        <GradientText
          colors={colors}
          animationSpeed={animationSpeed}
          style={{ fontSize, fontWeight: 700 }}
        >
          {content || '请输入文本'}
        </GradientText>
      </Card>

      <Card title="3. 全部预设并排" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {PRESETS.map((p) => (
            <div key={p.label}>
              <div style={{ marginBottom: 4, color: '#8c8c8c', fontSize: 12 }}>
                {p.label}
              </div>
              <GradientText
                colors={p.colors}
                style={{ fontSize: 28, fontWeight: 600 }}
              >
                {p.label} · The quick brown fox
              </GradientText>
            </div>
          ))}
        </Space>
      </Card>

      <Card title="4. 不同字号" size="small">
        <Space direction="vertical" size="small">
          {[14, 18, 24, 32, 48].map((size) => (
            <GradientText
              key={size}
              colors={colors}
              style={{ fontSize: size, fontWeight: 600 }}
            >
              {size}px · Agentic UI
            </GradientText>
          ))}
        </Space>
      </Card>

      <Divider style={{ margin: 0 }} />
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        提示：将 animationSpeed 调到极大值（例如
        9999）可以得到接近静态的渐变效果。
      </div>
    </div>
  );
};
