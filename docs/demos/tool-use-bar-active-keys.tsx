import { ToolUseBar } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const ToolUseBarActiveKeysDemo = () => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const tools = [
    {
      id: 'search',
      toolName: '文件搜索',
      toolTarget: '搜索 "react" 相关文件',
      time: '3',
      status: 'success' as const,
    },
    {
      id: 'analyze',
      toolName: '代码分析',
      toolTarget: '分析 src/components 目录',
      time: '3',
      status: 'loading' as const,
    },
    {
      id: 'format',
      toolName: '代码格式化',
      toolTarget: '格式化 TypeScript 文件',
      time: '3',
      status: 'error' as const,
    },
    {
      id: 'test',
      toolName: '单元测试',
      toolTarget: '运行 Jest 测试套件',
      time: '3',
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

      <div style={{ marginTop: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>tools</strong>: 工具列表数组，每个工具包含
            id、toolName、toolTarget、time、status 等属性
          </li>
          <li>
            <strong>activeKeys</strong>: 当前激活的工具 ID 数组，受控模式
          </li>
          <li>
            <strong>onActiveKeysChange</strong>: 激活工具变化时的回调函数
          </li>
          <li>
            <strong>onToolClick</strong>: 点击工具项时的回调函数
          </li>
          <li>
            <strong>status</strong>: 工具状态，支持 &apos;success&apos; |
            &apos;loading&apos; | &apos;error&apos; | &apos;idle&apos;
          </li>
        </ul>

        <h4>操作说明:</h4>
        <ul>
          <li>点击工具项可以激活/取消激活</li>
          <li>支持多选激活</li>
          <li>激活状态由外部 state 控制</li>
          <li>不同状态的工具项有不同的视觉样式</li>
        </ul>
      </div>
    </div>
  );
};

export default ToolUseBarActiveKeysDemo;
