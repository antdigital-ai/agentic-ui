import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const initValue = `# Jinja 模板能力示例

在编辑器中输入 \`{}\` 可打开模板面板，选择常用 Jinja 片段快速插入。

下方为 Jinja 语法高亮示例（变量、标签、注释会以不同颜色显示）：

变量插值：{{ user.name }}

条件：{% if count > 0 %}有 {{ count }} 条{% endif %}

循环：{% for item in list %}
  - {{ item.title }}
{% endfor %}

{# 这是 Jinja 注释，不会输出 #}
`;

export default () => {
  return (
    <div
      style={{
        padding: 24,
        border: '1px solid #f0f0f0',
        margin: '20px auto',
        width: '100%',
        maxWidth: 720,
        background: '#fff',
      }}
    >
      <MarkdownEditor
        width="100%"
        height={360}
        initValue={initValue}
        toolBar={{ enable: true, min: true }}
        jinja={{
          enable: true,
          docLink: 'https://jinja.palletsprojects.com/',
          templatePanel: {
            trigger: '{}',
            enable: true,
          },
        }}
        onChange={(value) => {
          console.log('onChange', value?.slice(0, 100));
        }}
      />
      <p style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
        提示：在段落中输入 <kbd>{'{}'}</kbd> 可打开 Jinja 模板面板，使用方向键选择、Enter 确认、Esc 关闭。
      </p>
    </div>
  );
};
