import { ToolUseBar } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useState } from 'react';

const tools = [
  {
    id: 'tool1',
    toolName: 'Search Code',
    toolTarget: 'baidu.com',
    time: '1.3s',
    status: 'success' as const,
    content: <div>这是搜索代码的详细内容，包含了一些执行结果和相关信息。</div>,
  },
  {
    id: 'tool2',
    toolName: 'Read File',
    toolTarget: 'xxx.docx',
    time: '2.3s',
    status: 'error' as const,
    errorMessage: '文件读取失败：文件不存在或无权限访问',
  },
  {
    id: 'tool3',
    toolName: 'Edit File',
    toolTarget: 'xx.md',
    time: '2.3s',
    status: 'success' as const,
    content: (
      <div>
        <p>文件编辑成功，修改了以下内容：</p>
        <ul>
          <li>添加了新的章节标题</li>
          <li>更新了代码示例</li>
          <li>修复了格式问题</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'tool4',
    toolName: 'Generate Report',
    toolTarget: 'report.pdf',
    time: '5.1s',
    status: 'loading' as const,
  },
  {
    id: 'tool5',
    toolName: 'Generate Report',
    toolTarget: 'report.pdf',
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

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>tools</strong>: 工具列表数组，每个工具包含
            id、toolName、toolTarget、time、status、content、errorMessage 等属性
          </li>
          <li>
            <strong>expandedKeys</strong>: 当前展开的工具 ID 数组，受控模式
          </li>
          <li>
            <strong>onExpandedKeysChange</strong>: 展开状态变化时的回调函数
          </li>
          <li>
            <strong>onToolClick</strong>: 点击工具项时的回调函数
          </li>
          <li>
            <strong>content</strong>: 工具项的详细内容，React 节点
          </li>
          <li>
            <strong>errorMessage</strong>: 错误信息，当 status 为
            &apos;error&apos; 时显示
          </li>
        </ul>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 16,
          background: '#f5f5f5',
          borderRadius: 8,
        }}
      >
        <h4>功能说明</h4>
        <ul>
          <li>
            🎛️ <strong>受控展开</strong> - 通过 <code>expandedKeys</code>{' '}
            完全控制展开状态
          </li>
          <li>
            📝 <strong>状态同步</strong> - <code>onExpandedKeysChange</code>{' '}
            回调确保状态同步
          </li>
          <li>
            🔄 <strong>批量操作</strong> - 支持批量展开/收起多个工具项
          </li>
          <li>
            📊 <strong>状态监控</strong> - 实时显示当前展开的工具列表
          </li>
          <li>
            🎯 <strong>精确控制</strong> - 可以单独控制任意工具项的展开状态
          </li>
        </ul>
        <p>
          <strong>操作提示:</strong>
          使用上方按钮控制展开状态，或直接点击工具项的展开按钮。
          注意只有包含内容或错误信息的工具项才会显示展开按钮。
        </p>
      </div>
    </div>
  );
};

export default ToolUseBarExpandedKeysDemo;
