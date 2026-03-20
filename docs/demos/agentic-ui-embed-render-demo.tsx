import { MarkdownEditor } from '@ant-design/agentic-ui';
import { Card } from 'antd';
import React from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

const AGENTIC_SECTION_HEADING = '## Agentic UI 嵌入块';

/**
 * 演示 `agentic-ui-task` / `agentic-ui-usertoolbar` 在自定义元素渲染（eleItemRender）下的展示。
 * 内容与 `newEnergyFundContent` 文末「Agentic UI 嵌入块」一致（单源维护）。
 */
export default () => {
  const initValue = newEnergyFundContent.includes(AGENTIC_SECTION_HEADING)
    ? newEnergyFundContent.slice(
        newEnergyFundContent.indexOf(AGENTIC_SECTION_HEADING),
      )
    : '';

  return (
    <div>
      <MarkdownEditor
        width="100%"
        height="70vh"
        initValue={initValue}
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
