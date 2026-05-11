import { ToolUseBarThink } from '@ant-design/agentic-ui';
import { Brain, Sparkles, Terminal } from '@sofa-design/icons';
import { Button, Card, Divider, Input, Select, Space, Switch, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

const SHORT_CONTENT = `（示例）正在分析问题：用户希望优化 React 项目首屏渲染时间。先看 bundle 体积，再看组件树。`;

const LONG_CONTENT = `好的，我需要帮用户分析这个 React 项目的性能瓶颈。首先，让我逐步检查几个关键维度。

**1. 组件渲染分析**
查看组件树发现，Dashboard 页面包含 12 个子组件，其中 ChartPanel 和 DataTable 是渲染开销最大的两个。ChartPanel 在每次父组件状态更新时都会触发完整重渲染，即使图表数据并未变化。

**2. 数据流优化**
当前使用的是顶层 Context 传递全局状态，导致任何状态变更都会引起所有消费组件的重渲染。建议将状态拆分为独立的 Context：UserContext、ThemeContext、DataContext。

**3. 网络请求优化**
API 请求未做去重和缓存处理，同一页面在 mount 时会发起 6 个请求，其中 3 个存在数据重叠。建议引入 SWR 或 TanStack Query 进行请求去重和缓存管理。

**4. 打包体积分析**
Bundle 总体积 2.4MB，其中 moment.js 占 680KB（28%），建议替换为 dayjs。lodash 全量引入占 520KB，建议按需导入或使用 lodash-es。

**5. 优化建议汇总**
- 为 ChartPanel 添加 React.memo 和自定义比较函数
- 使用 useMemo 缓存图表配置和数据转换结果
- 拆分全局 Context 为细粒度的领域 Context
- 引入 TanStack Query 统一管理 API 请求
- 替换 moment.js 为 dayjs，lodash 改为按需引入
- 对长列表使用 react-window 虚拟化渲染

预计这些优化可以将首屏渲染时间从 3.2s 降低到 1.1s，Lighthouse 性能评分从 62 提升至 90 以上。`;

const STATUS_OPTIONS = ['loading', 'success', 'error'] as const;
const ICON_OPTIONS = ['default', 'sparkles', 'terminal'] as const;

const renderIcon = (key: (typeof ICON_OPTIONS)[number]) => {
  switch (key) {
    case 'sparkles':
      return <Sparkles />;
    case 'terminal':
      return <Terminal />;
    default:
      return <Brain />;
  }
};

export default () => {
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]>('loading');
  const [light, setLight] = useState(false);
  const [longContent, setLongContent] = useState(true);
  const [streaming, setStreaming] = useState(true);
  const [iconKey, setIconKey] =
    useState<(typeof ICON_OPTIONS)[number]>('default');

  const [toolName, setToolName] = useState('深度思考');
  const [toolTarget, setToolTarget] = useState('分析性能瓶颈');
  const [time, setTime] = useState('2.3s');

  const [expanded, setExpanded] = useState<boolean | undefined>(undefined);
  const [floatingExpanded, setFloatingExpanded] = useState<boolean | undefined>(
    undefined,
  );

  const baseContent = longContent ? LONG_CONTENT : SHORT_CONTENT;

  const [streamedContent, setStreamedContent] = useState(
    baseContent.slice(0, 40),
  );
  const [cursor, setCursor] = useState(40);

  useEffect(() => {
    setStreamedContent(baseContent.slice(0, 40));
    setCursor(40);
  }, [baseContent]);

  useEffect(() => {
    if (!streaming) return;
    if (cursor >= baseContent.length) return;
    const timer = setTimeout(() => {
      const chunkSize = Math.floor(Math.random() * 8) + 4;
      const next = Math.min(cursor + chunkSize, baseContent.length);
      setStreamedContent(baseContent.slice(0, next));
      setCursor(next);
    }, 100);
    return () => clearTimeout(timer);
  }, [streaming, cursor, baseContent]);

  const thinkContent = streaming ? streamedContent : baseContent;

  const handleReplayStream = () => {
    setStreamedContent(baseContent.slice(0, 40));
    setCursor(40);
    setStreaming(true);
  };

  const playgroundProps = useMemo(
    () => ({
      toolName,
      toolTarget,
      time,
      icon: renderIcon(iconKey),
      thinkContent,
      status,
      light,
      expanded,
      onExpandedChange: setExpanded,
      floatingExpanded,
      onFloatingExpandedChange: setFloatingExpanded,
    }),
    [
      toolName,
      toolTarget,
      time,
      iconKey,
      thinkContent,
      status,
      light,
      expanded,
      floatingExpanded,
    ],
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
      <Card title="1. 配置面板" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap size="large">
            <Space>
              <span>status</span>
              <Select
                value={status}
                onChange={setStatus}
                style={{ width: 140 }}
                options={STATUS_OPTIONS.map((v) => ({ label: v, value: v }))}
              />
            </Space>
            <Space>
              <span>light</span>
              <Switch checked={light} onChange={setLight} />
            </Space>
            <Space>
              <span>icon</span>
              <Select
                value={iconKey}
                onChange={setIconKey}
                style={{ width: 140 }}
                options={ICON_OPTIONS.map((v) => ({ label: v, value: v }))}
              />
            </Space>
            <Space>
              <span>长内容</span>
              <Switch checked={longContent} onChange={setLongContent} />
            </Space>
            <Space>
              <span>流式追加</span>
              <Switch checked={streaming} onChange={setStreaming} />
            </Space>
          </Space>

          <Space wrap>
            <Space>
              <span>toolName</span>
              <Input
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                style={{ width: 180 }}
              />
            </Space>
            <Space>
              <span>toolTarget</span>
              <Input
                value={toolTarget}
                onChange={(e) => setToolTarget(e.target.value)}
                style={{ width: 200 }}
              />
            </Space>
            <Space>
              <span>time</span>
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ width: 100 }}
              />
            </Space>
          </Space>

          <Space wrap>
            <Button onClick={handleReplayStream}>重放流式输出</Button>
            <Button onClick={() => setExpanded((v) => !v)}>
              切换 expanded（受控）
            </Button>
            <Button onClick={() => setFloatingExpanded((v) => !v)}>
              切换 floatingExpanded（受控）
            </Button>
            <Tag>expanded: {String(expanded)}</Tag>
            <Tag>floatingExpanded: {String(floatingExpanded)}</Tag>
          </Space>
        </Space>
      </Card>

      <Card title="2. 实时预览" size="small">
        <ToolUseBarThink {...playgroundProps} />
      </Card>

      <Card title="3. 三种 status 并排" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {STATUS_OPTIONS.map((s) => (
            <div key={s}>
              <Tag color="blue" style={{ marginBottom: 8 }}>
                status = "{s}"
              </Tag>
              <ToolUseBarThink
                toolName={`深度思考 - ${s}`}
                toolTarget="性能优化方案"
                time="4.8s"
                status={s}
                thinkContent={baseContent}
              />
            </div>
          ))}
        </Space>
      </Card>

      <Card title="4. light 轻量模式" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <ToolUseBarThink
            light
            toolName="轻量思考"
            thinkContent={SHORT_CONTENT}
          />
          <ToolUseBarThink
            light
            toolName="轻量思考（长内容）"
            thinkContent={baseContent}
            defaultExpanded
          />
        </Space>
      </Card>

      <Card title="5. 自定义 classNames / styles（局部覆盖）" size="small">
        <ToolUseBarThink
          toolName="带自定义样式的思考"
          toolTarget="自定义 styles"
          time="3.1s"
          status="success"
          thinkContent={baseContent}
          classNames={{
            root: 'my-think-root',
          }}
          styles={{
            root: {
              boxShadow: '0 4px 16px rgba(22, 119, 255, 0.16)',
              borderRadius: 12,
            },
            name: { color: '#1677ff' },
            content: { fontStyle: 'italic' },
          }}
        />
      </Card>

      <Divider style={{ margin: 0 }} />
      <div style={{ color: '#8c8c8c', fontSize: 12 }}>
        提示：status = loading 时组件会自动 expanded；非 light 模式下还会显示
        floatingExpand 浮动展开按钮，便于在收起状态偷看实时内容。
      </div>
    </div>
  );
};
