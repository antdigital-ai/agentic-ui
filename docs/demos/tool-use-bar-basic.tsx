import { ToolUseBar } from '@ant-design/agentic-ui';
import { Space } from 'antd';
import React, { useState } from 'react';

const ToolUseBarBasicDemo = () => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  const tools = [
    {
      id: 'search',
      toolName: 'web_search',
      toolTarget: '搜索「Next.js 14 App Router 迁移指南」',
      time: '2.1',
      status: 'success' as const,
      content: (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>解析用户搜索意图和关键词</li>
          <li>向搜索引擎发送结构化查询请求</li>
          <li>对返回结果进行相关性排序和去重</li>
          <li>提取核心信息片段并生成摘要</li>
          <li>返回 Top 5 最相关的搜索结果</li>
        </ul>
      ),
    },
    {
      id: 'analyze',
      toolName: 'code_analysis',
      toolTarget: '分析 src/app/ 目录结构',
      status: 'loading' as const,
      content: (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>扫描目录结构和文件依赖关系</li>
          <li>识别路由层级和页面组件</li>
          <li>检测 Server/Client Component 使用情况</li>
          <li>分析 Data Fetching 模式和缓存策略</li>
          <li>生成项目架构分析报告</li>
        </ul>
      ),
    },
    {
      id: 'format',
      toolName: 'eslint_fix',
      toolTarget: '修复 TypeScript 类型错误',
      time: '1.5',
      errorMessage: '检测到 3 个无法自动修复的类型错误，需要手动处理',
      status: 'error' as const,
    },
    {
      id: 'test',
      toolName: 'run_tests',
      toolTarget: (
        <Space size={8}>
          <span>执行 Vitest 测试套件</span>
          <span>4.2s</span>
        </Space>
      ),
      time: '4.2',
      status: 'idle' as const,
    },
    {
      id: 'deploy',
      toolName: 'create_pr',
      toolTarget: (
        <Space size={8}>
          <span>创建 Pull Request</span>
          <span>1.0s</span>
        </Space>
      ),
      status: 'idle' as const,
    },
    {
      id: 'notify',
      toolName: 'send_notification',
      toolTarget: '通知代码审查人员',
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
    </div>
  );
};

export default ToolUseBarBasicDemo;
