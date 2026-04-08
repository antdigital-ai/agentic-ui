import { jinjaPlugin, MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const initValue = `# 通过 jinjaPlugin 启用

使用 \`plugins={[jinjaPlugin]}\` 替代 \`jinja\` prop 即可启用 Jinja 能力。

变量：{{ user.name }}

条件：{% if logged_in %}已登录{% endif %}

{# 插件方式与 prop 方式效果一致 #}
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
        plugins={[jinjaPlugin]}
        onChange={(value) => {
          console.log('onChange', value?.slice(0, 100));
        }}
      />
      <p style={{ marginTop: 16, color: '#666', fontSize: 12 }}>
        通过 <code>plugins=[jinjaPlugin]</code> 启用，输入 <kbd>{'{}'}</kbd>{' '}
        可打开模板面板。
      </p>
    </div>
  );
};
