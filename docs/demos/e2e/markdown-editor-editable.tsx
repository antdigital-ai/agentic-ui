import { MarkdownEditor } from '@ant-design/agentic-ui';
import { ChartElement } from '@ant-design/agentic-ui/Plugins/chart';
import { CodeElement } from '@ant-design/agentic-ui/Plugins/code';
import { MermaidElement } from '@ant-design/agentic-ui/Plugins/mermaid';
import React from 'react';

/**
 * E2E 可编辑 MarkdownEditor：与文档预览 demo 区分，禁用 reportMode，否则 Slate 只读导致快捷键/输入规则测试失效。
 */
export default () => (
  <MarkdownEditor
    width="100%"
    height="70vh"
    initValue=""
    markdown={{ matchInputToNode: true }}
    plugins={[
      {
        elements: {
          code: CodeElement,
          chart: ChartElement,
          mermaid: MermaidElement,
        },
      },
    ]}
  />
);
