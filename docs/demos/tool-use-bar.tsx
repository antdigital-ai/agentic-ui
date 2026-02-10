import { ToolUseBar } from '@ant-design/agentic-ui';
import React from 'react';

const tools = [
  {
    id: '1',
    toolName: 'web_search',
    toolTarget: '搜索「React 19 新特性总结」',
    time: '1.3s',
  },
  {
    id: '2',
    toolName: 'read_file',
    toolTarget: 'src/components/Dashboard.tsx',
    time: '0.8s',
  },
  {
    id: '3',
    toolName: 'edit_file',
    toolTarget: 'src/hooks/useDataFetch.ts',
    time: '2.1s',
  },
];

export default () => {
  return (
    <div>
      <ToolUseBar tools={tools} />
    </div>
  );
};
