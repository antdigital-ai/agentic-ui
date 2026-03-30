/**
 * @fileoverview 提示块 (Tip blocks) 演示
 * 展示 ::: 三冒号与 :: 双冒号容器语法渲染的 info / warning / success / error / tip 等提示块
 */

import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const tipBlocksMarkdown = `:::info

这是一个信息提示块。

:::

:::warning

这是一个警告提示块。

:::

:::success

这是一个成功提示块。

:::

:::error

这是一个错误提示块。

:::

:::tip{title="提示"}

这是一条带标题的提示块。

:::

::warning
::warning 双冒号写法也被支持，等同于 :::warning。开头 ::warning，结尾 :: 均可。

::`;

const TipBlocksDemo: React.FC = () => {
  return (
    <div style={{ padding: '16px', maxWidth: '560px' }}>
      <MarkdownEditor readonly initValue={tipBlocksMarkdown} />
    </div>
  );
};

export default TipBlocksDemo;
