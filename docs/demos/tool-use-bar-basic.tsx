import { ToolUseBar } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const ToolUseBarBasicDemo = () => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const tools = [
    {
      id: 'search',
      toolName: '文件搜索',
      toolTarget: '搜索 "react" 相关文件',
      time: '3',
      status: 'success' as const,
      content: (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>分析插件需求及目标功能</li>
          <li>设计Chrome扩展插件架构 实现核心截图和检测逻辑</li>
          <li>Manus 正在工作：开发图片输出和导出功能</li>
          <li>验证插件功能是否正常</li>
          <li>报告并将插件发送给用户</li>
        </ul>
      ),
    },
    {
      id: 'analyze',
      toolName: '代码分析',
      toolTarget: '分析 src/components 目录',
      status: 'loading' as const,
      content: (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>分析插件需求及目标功能</li>
          <li>设计Chrome扩展插件架构 实现核心截图和检测逻辑</li>
          <li>Manus 正在工作：开发图片输出和导出功能</li>
          <li>验证插件功能是否正常</li>
          <li>报告并将插件发送给用户</li>
        </ul>
      ),
    },
    {
      id: 'format',
      toolName: '代码格式化',
      toolTarget: '格式化 TypeScript 文件',
      time: '3',
      errorMessage: '网络请求异常，工具调用失败',
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
      <h3>ToolUseBar 基础演示</h3>
      <p>
        当前激活的工具: {activeKeys.length > 0 ? activeKeys.join(', ') : '无'}
      </p>

      <ToolUseBar
        tools={tools}
        activeKeys={activeKeys}
        onActiveKeysChange={handleActiveKeysChange}
        onToolClick={handleToolClick}
      />

      <div style={{ marginBottom: '20px' }}>
        <h4>Light 模式：</h4>
        <ToolUseBar
          tools={tools}
          activeKeys={activeKeys}
          onActiveKeysChange={handleActiveKeysChange}
          onToolClick={handleToolClick}
          light={true}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>tools</strong>: 工具列表数组，每个工具包含
            id、toolName、toolTarget、time、status 等属性
          </li>
          <li>
            <strong>activeKeys</strong>: 当前激活的工具 ID 数组
          </li>
          <li>
            <strong>onActiveKeysChange</strong>: 激活工具变化时的回调函数
          </li>
          <li>
            <strong>onToolClick</strong>: 点击工具项时的回调函数
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ToolUseBarBasicDemo;
