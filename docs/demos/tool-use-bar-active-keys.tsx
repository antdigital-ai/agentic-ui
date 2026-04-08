import { ToolUseBar } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const ToolUseBarActiveKeysDemo = () => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const tools = [
    {
      id: 'search',
      toolName: 'web_search',
      toolTarget: '搜索「React Server Components 最佳实践」',
      time: '1.8',
      status: 'success' as const,
    },
    {
      id: 'analyze',
      toolName: 'code_analysis',
      toolTarget: '分析 src/app/ 路由结构',
      time: '3.2',
      status: 'loading' as const,
    },
    {
      id: 'format',
      toolName: 'eslint_fix',
      toolTarget: '自动修复 ESLint 规则冲突',
      time: '0.9',
      status: 'error' as const,
    },
    {
      id: 'test',
      toolName: 'run_tests',
      toolTarget: '执行 Vitest 单元测试',
      time: '5.6',
      status: 'idle' as const,
    },
  ];

  const handleActiveKeysChange = (newActiveKeys: string[]) => {
    setActiveKeys(newActiveKeys);
    console.log('激活的工具:', newActiveKeys);
  };

  const handleToolClick = (toolId: string) => {
    console.log('点击的工具:', toolId);
  };

  return (
    <div style={{ padding: '12px' }}>
      <h3>ToolUseBar 受控模式演示</h3>
      <p>
        当前激活的工具: {activeKeys.length > 0 ? activeKeys.join(', ') : '无'}
      </p>

      <ToolUseBar
        tools={tools}
        activeKeys={activeKeys}
        onActiveKeysChange={handleActiveKeysChange}
        onToolClick={handleToolClick}
      />
    </div>
  );
};

export default ToolUseBarActiveKeysDemo;
