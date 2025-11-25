import { Mermaid } from '@ant-design/agentic-ui/Plugins/mermaid/Mermaid';
import React from 'react';

const MermaidFlowchartExample: React.FC = () => {
  // mermaid流程图
  const data = `
    graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[其他操作]
    C --> E[结束]
    D --> E
    `;

  return (
    <div style={{ padding: '12px' }}>
      <Mermaid
        element={{ type: 'code', value: data, children: [{ text: data }] }}
      />
    </div>
  );
};
export default MermaidFlowchartExample;
