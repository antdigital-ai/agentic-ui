import { ToolUseBar } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useState } from 'react';

const tools = [
  {
    id: 'tool1',
    toolName: 'web_search',
    toolTarget: '搜索「TypeScript 5.0 新特性」',
    time: '1.3s',
    status: 'success' as const,
    content: (
      <div>
        找到 8 个相关结果，已提取核心内容：
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li>装饰器（Decorators）正式进入 Stage 3</li>
          <li>const 类型参数支持</li>
          <li>枚举类型增强和多配置文件继承</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'tool2',
    toolName: 'read_file',
    toolTarget: 'tsconfig.json',
    time: '0.3s',
    status: 'error' as const,
    errorMessage: '文件读取失败：tsconfig.json 存在 JSON 语法错误（第 15 行）',
  },
  {
    id: 'tool3',
    toolName: 'edit_file',
    toolTarget: 'src/types/api.d.ts',
    time: '1.8s',
    status: 'success' as const,
    content: (
      <div>
        <p>类型定义文件已更新，修改内容：</p>
        <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
          <li>新增 UserProfile 接口定义</li>
          <li>更新 ApiResponse 泛型约束</li>
          <li>修复 Pagination 类型的可选属性标注</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'tool4',
    toolName: 'generate_report',
    toolTarget: '生成类型覆盖率报告',
    time: '8.5s',
    status: 'loading' as const,
  },
  {
    id: 'tool5',
    toolName: 'run_type_check',
    toolTarget: '执行全量 TypeScript 类型检查',
    status: 'loading' as const,
  },
];

const ToolUseBarExpandedKeysDemo: React.FC = () => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['tool1']);

  const handleExpandAll = () => {
    const toolsWithContent = tools.filter(
      (tool) => tool.content || tool.errorMessage,
    );
    setExpandedKeys(toolsWithContent.map((tool) => tool.id));
  };

  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  const handleToggleFirst = () => {
    setExpandedKeys((prev) =>
      prev.includes('tool1')
        ? prev.filter((id) => id !== 'tool1')
        : [...prev, 'tool1'],
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h3>展开状态控制演示</h3>
        <p>
          通过 <code>expandedKeys</code> 和 <code>onExpandedKeysChange</code>{' '}
          属性可以控制工具项的展开状态。
        </p>

        <Space style={{ marginBottom: 16 }}>
          <Button onClick={handleExpandAll}>展开所有</Button>
          <Button onClick={handleCollapseAll}>收起所有</Button>
          <Button onClick={handleToggleFirst}>切换第一项</Button>
        </Space>

        <div style={{ marginBottom: 8 }}>
          <strong>当前展开的工具：</strong> {expandedKeys.join(', ') || '无'}
        </div>
      </div>

      <ToolUseBar
        tools={tools}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
        onToolClick={(id: string) => console.log('Tool clicked:', id)}
      />
    </div>
  );
};

export default ToolUseBarExpandedKeysDemo;
