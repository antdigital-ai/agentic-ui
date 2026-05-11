import { LayoutHeader } from '@ant-design/agentic-ui';
import { CircleHelp, Notify, Settings } from '@sofa-design/icons';
import { Button, Card, Input, Space, Switch, Tag, message } from 'antd';
import React, { useState } from 'react';

const STAGE_STYLE: React.CSSProperties = {
  border: '1px solid #f0f0f0',
  borderRadius: 8,
  background: '#fafafa',
  overflow: 'hidden',
};

export default () => {
  const [title, setTitle] = useState('AI 助手');
  const [showShare, setShowShare] = useState(true);
  const [leftCollapsible, setLeftCollapsible] = useState(true);
  const [rightCollapsible, setRightCollapsible] = useState(true);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const [enableLeftExtra, setEnableLeftExtra] = useState(false);
  const [enableRightExtra, setEnableRightExtra] = useState(true);

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <Card title="1. 文案与按钮开关" size="small">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <span>title</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: 220 }}
            />
            <Space>
              <span>showShare</span>
              <Switch checked={showShare} onChange={setShowShare} />
            </Space>
          </Space>
          <Space wrap size="large">
            <Space>
              <span>leftCollapsible</span>
              <Switch checked={leftCollapsible} onChange={setLeftCollapsible} />
            </Space>
            <Space>
              <span>rightCollapsible</span>
              <Switch
                checked={rightCollapsible}
                onChange={setRightCollapsible}
              />
            </Space>
            <Space>
              <span>leftExtra</span>
              <Switch checked={enableLeftExtra} onChange={setEnableLeftExtra} />
            </Space>
            <Space>
              <span>rightExtra</span>
              <Switch
                checked={enableRightExtra}
                onChange={setEnableRightExtra}
              />
            </Space>
          </Space>
        </Space>
      </Card>

      <Card title="2. 受控折叠状态" size="small">
        <Space wrap>
          <Tag color={leftCollapsed ? 'orange' : 'green'}>
            leftCollapsed: {String(leftCollapsed)}
          </Tag>
          <Tag color={rightCollapsed ? 'orange' : 'green'}>
            rightCollapsed: {String(rightCollapsed)}
          </Tag>
          <Button onClick={() => setLeftCollapsed((v) => !v)}>
            切换 leftCollapsed
          </Button>
          <Button onClick={() => setRightCollapsed((v) => !v)}>
            切换 rightCollapsed
          </Button>
        </Space>
      </Card>

      <Card title="3. 实时预览" size="small">
        <div style={STAGE_STYLE}>
          <LayoutHeader
            title={title}
            showShare={showShare}
            leftCollapsible={leftCollapsible}
            rightCollapsible={rightCollapsible}
            leftCollapsed={leftCollapsed}
            rightCollapsed={rightCollapsed}
            onLeftCollapse={(c) => {
              setLeftCollapsed(c);
              message.info(`左侧折叠：${c}`);
            }}
            onRightCollapse={(c) => {
              setRightCollapsed(c);
              message.info(`右侧折叠：${c}`);
            }}
            onShare={() => message.success('已分享')}
            leftExtra={
              enableLeftExtra ? (
                <Tag color="processing" style={{ marginInlineStart: 8 }}>
                  Beta
                </Tag>
              ) : undefined
            }
            rightExtra={
              enableRightExtra ? (
                <Space size={4}>
                  <Button
                    type="text"
                    size="small"
                    icon={<Notify />}
                    aria-label="通知"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<CircleHelp />}
                    aria-label="帮助"
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<Settings />}
                    aria-label="设置"
                  />
                </Space>
              ) : undefined
            }
          />
        </div>
      </Card>

      <Card
        title="4. 非受控（leftDefaultCollapsed / rightDefaultCollapsed）"
        size="small"
      >
        <div style={STAGE_STYLE}>
          <LayoutHeader
            title="非受控示例"
            leftCollapsible
            rightCollapsible
            leftDefaultCollapsed
            rightDefaultCollapsed={false}
            showShare
          />
        </div>
        <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
          组件内部用 useMergedState 维护状态；不传 leftCollapsed /
          rightCollapsed 时回退到 leftDefaultCollapsed / rightDefaultCollapsed。
        </div>
      </Card>
    </div>
  );
};
