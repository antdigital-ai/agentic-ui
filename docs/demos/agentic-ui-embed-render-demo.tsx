import { MarkdownEditor } from '@ant-design/agentic-ui';
import { Card } from 'antd';
import React from 'react';
import { agenticUiEmbedDemoMarkdown } from './shared/agenticUiEmbedDemoMarkdown';

/**
 * 演示 `agentic-ui-task` / `agentic-ui-usertoolbar` 在自定义元素渲染（eleItemRender）下的展示。
 * 与 render.tsx 使用相同的 Card 包裹逻辑，仅聚焦嵌入块内容。
 */
export default () => {
  return (
    <div>
      <MarkdownEditor
        width="100%"
        height="70vh"
        initValue={agenticUiEmbedDemoMarkdown}
        eleItemRender={(props, defaultDom) => {
          if (
            props.element.type !== 'table-cell' &&
            props.element.type !== 'table-row' &&
            props.element.type !== 'head' &&
            props.element.type !== 'card-before' &&
            props.element.type !== 'card-after'
          ) {
            return (
              <Card
                title={props.element.type}
                style={{ marginBottom: 16 }}
                size="small"
                hoverable
              >
                {defaultDom}
              </Card>
            );
          }
          return defaultDom as React.ReactElement;
        }}
      />
    </div>
  );
};
