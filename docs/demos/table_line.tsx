import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';
import { newEnergyFundContent } from './shared/newEnergyFundContent';

const defaultValue = newEnergyFundContent;
export default () => {
  return (
    <div>
      <MarkdownEditor
        width={'100vw'}
        height={'100vh'}
        reportMode
        readonly
        initValue={defaultValue}
      />
      <div>
        <h4>Props 说明</h4>
        <ul>
          <li>
            <code>width</code> - 编辑器宽度，设置为 100vw 占满视口宽度
          </li>
          <li>
            <code>height</code> - 编辑器高度，设置为 100vh 占满视口高度
          </li>
          <li>
            <code>reportMode</code> - 报告模式，优化显示效果
          </li>
          <li>
            <code>readonly</code> - 只读模式，用户无法编辑内容
          </li>
          <li>
            <code>initValue</code> - 初始化的 Markdown 内容，包含表格数据
          </li>
        </ul>
      </div>
    </div>
  );
};
