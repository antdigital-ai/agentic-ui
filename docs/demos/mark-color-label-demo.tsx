import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const markdownContent = `## Mark 标签颜色与 Label 演示

普通高亮：<mark>默认高亮文本</mark>

自定义颜色：<mark color="#fff" bg="#1677ff">蓝底白字高亮</mark>

带 Label：<mark color="#fff" bg="#fa541c" label="重要">这是一段重要提示</mark>

仅背景色：<mark bg="#f6ffed">浅绿背景</mark>

仅文字颜色：<mark color="#eb2f96">粉色文字</mark>

带 Label 的 @提及：<mark color="#fff" bg="#722ed1" label="@qixian">期贤同学</mark>

组合使用：普通文本 <mark bg="#fff7e6" color="#d46b08" label="提醒">截止日期为本周五</mark> 请注意查收。
`;

const Demo: React.FC = () => {
  return (
    <MarkdownEditor
      initValue={markdownContent}
      readonly
      reportMode
      style={{ padding: 24 }}
    />
  );
};

export default Demo;
