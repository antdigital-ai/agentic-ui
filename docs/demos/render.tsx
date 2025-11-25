import { MarkdownEditor } from '@ant-design/agentic-ui';
import { Card } from 'antd';
import React from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

export default () => {
  return (
    <div>
      <MarkdownEditor
        width={'100vw'}
        height={'100vh'}
        initValue={newEnergyFundContent}
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
                extra={<a href="#">More</a>}
                style={{
                  marginBottom: 24,
                }}
                hoverable
              >
                {defaultDom}
              </Card>
            );
          }
          return defaultDom as React.ReactElement;
        }}
      />

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>width</strong>: 编辑器宽度
          </li>
          <li>
            <strong>height</strong>: 编辑器高度
          </li>
          <li>
            <strong>initValue</strong>: 编辑器的初始内容值
          </li>
          <li>
            <strong>eleItemRender</strong>:
            自定义元素渲染函数，用于自定义不同类型元素的渲染方式
          </li>
          <li>
            <strong>props.element.type</strong>:
            元素类型，用于判断是否需要特殊渲染
          </li>
        </ul>
      </div>
    </div>
  );
};
