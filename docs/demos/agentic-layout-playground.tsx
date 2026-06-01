import { AgenticLayout } from '@ant-design/agentic-ui';
import { Card, InputNumber, Slider, Space, Switch, Tag, message } from 'antd';
import React, { useState } from 'react';

const PANEL_STYLE: React.CSSProperties = {
  height: '100%',
  padding: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#595959',
};

const Left = () => (
  <div
    style={{
      ...PANEL_STYLE,
      background: 'linear-gradient(180deg, #f0f5ff 0%, #e6f4ff 100%)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>左侧栏</div>
      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
        通常用于会话历史 / 导航
      </div>
    </div>
  </div>
);

const Center = () => (
  <div style={{ ...PANEL_STYLE, background: '#fff' }}>
    <div style={{ textAlign: 'center', maxWidth: 480 }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>中间主区</div>
      <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 8 }}>
        中间区域自适应宽度，通常承载 ChatLayout 的对话流
      </div>
    </div>
  </div>
);

const Right = () => (
  <div
    style={{
      ...PANEL_STYLE,
      background: 'linear-gradient(180deg, #fff7e6 0%, #fffbe6 100%)',
    }}
  >
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600 }}>右侧栏</div>
      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
        通常用于工作区 / Workspace
      </div>
    </div>
  </div>
);

export default () => {
  const [showLeft, setShowLeft] = useState(true);
  const [showRight, setShowRight] = useState(true);
  const [leftWidth, setLeftWidth] = useState(256);
  const [rightWidth, setRightWidth] = useState(540);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftCollapsible, setLeftCollapsible] = useState(true);
  const [rightCollapsible, setRightCollapsible] = useState(true);
  const [showShare, setShowShare] = useState(true);
  const [title, setTitle] = useState('Agentic 智能体');

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Card title="1. 三栏开关与宽度" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap size="large">
            <Space>
              <span>渲染左侧</span>
              <Switch checked={showLeft} onChange={setShowLeft} />
            </Space>
            <Space>
              <span>渲染右侧</span>
              <Switch checked={showRight} onChange={setShowRight} />
            </Space>
            <Space>
              <span>showShare</span>
              <Switch checked={showShare} onChange={setShowShare} />
            </Space>
            <Space>
              <span>title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  height: 28,
                  padding: '0 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 4,
                }}
              />
            </Space>
          </Space>
          <Space wrap size="large">
            <Space>
              <span style={{ minWidth: 90 }}>leftWidth</span>
              <Slider
                min={160}
                max={400}
                value={leftWidth}
                onChange={setLeftWidth}
                style={{ width: 220 }}
              />
              <InputNumber
                min={160}
                max={400}
                value={leftWidth}
                onChange={(v) => setLeftWidth(v ?? 256)}
                addonAfter="px"
              />
            </Space>
            <Space>
              <span style={{ minWidth: 90 }}>rightWidth</span>
              <Slider
                min={400}
                max={800}
                value={rightWidth}
                onChange={setRightWidth}
                style={{ width: 220 }}
              />
              <InputNumber
                min={0}
                max={1200}
                value={rightWidth}
                onChange={(v) => setRightWidth(v ?? 540)}
                addonAfter="px"
              />
            </Space>
          </Space>
        </Space>
      </Card>

      <Card title="2. 折叠（受控）" size="small">
        <Space wrap>
          <Space>
            <span>leftCollapsible</span>
            <Switch checked={leftCollapsible} onChange={setLeftCollapsible} />
          </Space>
          <Space>
            <span>rightCollapsible</span>
            <Switch checked={rightCollapsible} onChange={setRightCollapsible} />
          </Space>
          <Tag color={leftCollapsed ? 'orange' : 'green'}>
            leftCollapsed: {String(leftCollapsed)}
          </Tag>
          <Tag color={rightCollapsed ? 'orange' : 'green'}>
            rightCollapsed: {String(rightCollapsed)}
          </Tag>
        </Space>
      </Card>

      <Card title="3. 实时预览（拖拽右栏分隔条可调整宽度）" size="small">
        <div
          style={{
            border: '1px solid #f0f0f0',
            borderRadius: 8,
            overflow: 'hidden',
            height: 480,
          }}
        >
          <AgenticLayout
            left={showLeft ? <Left /> : undefined}
            center={<Center />}
            right={showRight ? <Right /> : undefined}
            leftWidth={leftWidth}
            rightWidth={rightWidth}
            header={{
              title,
              showShare,
              leftCollapsible,
              rightCollapsible,
              leftCollapsed,
              rightCollapsed,
              onLeftCollapse: setLeftCollapsed,
              onRightCollapse: setRightCollapsed,
              onShare: () => message.success('Share clicked'),
            }}
          />
        </div>
      </Card>

      <Card title="4. 仅左 / 仅右 / 仅中（无侧栏）三种典型配置" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {[
            { label: '只有左侧栏', left: <Left />, right: undefined },
            { label: '只有右侧栏', left: undefined, right: <Right /> },
            { label: '无侧栏（沉浸式）', left: undefined, right: undefined },
          ].map((cfg) => (
            <div key={cfg.label}>
              <Tag color="blue" style={{ marginBottom: 8 }}>
                {cfg.label}
              </Tag>
              <div
                style={{
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  overflow: 'hidden',
                  height: 220,
                }}
              >
                <AgenticLayout
                  left={cfg.left}
                  center={<Center />}
                  right={cfg.right}
                  header={{ title: cfg.label }}
                />
              </div>
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
};
