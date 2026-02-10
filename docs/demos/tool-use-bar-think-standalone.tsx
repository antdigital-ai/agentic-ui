import { ToolUseBarThink } from '@ant-design/agentic-ui';
import React, { useEffect, useState } from 'react';

const fullThinkContent = `好的，我需要帮用户分析这个 React 项目的性能瓶颈。首先，让我逐步检查几个关键维度。

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

const ToolUseBarThinkDemo = () => {
  const [expanded, setExpanded] = useState(false);
  const [floatingExpanded, setFloatingExpanded] = useState(false);
  const [thinkContent, setThinkContent] = useState(
    `好的，我需要帮用户分析这个 React 项目的性能瓶颈。`,
  );
  const [currentIndex, setCurrentIndex] = useState(100);

  useEffect(() => {
    if (currentIndex < fullThinkContent.length) {
      const timer = setTimeout(() => {
        const chunkSize = Math.floor(Math.random() * 10) + 5;
        setThinkContent(fullThinkContent.slice(0, currentIndex + chunkSize));
        setCurrentIndex(currentIndex + chunkSize);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  const isLoading = currentIndex < fullThinkContent.length;
  return (
    <div style={{ padding: '12px' }}>
      <h3>ToolUseBarThink 不同状态对比</h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100vw',
        }}
      >
        {/* Loading 状态 */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h4>Loading 状态 </h4>
          <ToolUseBarThink
            toolName="思考中..."
            toolTarget="分析性能瓶颈"
            time="2.3s"
            status={isLoading ? 'loading' : 'success'}
            expanded={expanded}
            onExpandedChange={setExpanded}
            floatingExpanded={floatingExpanded}
            onFloatingExpandedChange={setFloatingExpanded}
            thinkContent={thinkContent}
          />
        </div>

        {/* Success 状态 */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h4>Success 状态 </h4>

          <ToolUseBarThink
            toolName="思考完成"
            toolTarget="性能优化方案"
            time="4.8s"
            status="success"
            thinkContent={thinkContent}
          />
        </div>

        {/* Light 模式 */}
        <div style={{ flex: 1, maxWidth: '500px' }}>
          <h4>轻量思考 状态 </h4>

          <ToolUseBarThink
            light
            toolName="轻量思考"
            thinkContent={thinkContent}
          />
        </div>
      </div>
    </div>
  );
};

export default ToolUseBarThinkDemo;
