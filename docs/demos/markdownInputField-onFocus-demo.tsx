import { MarkdownInputField } from '@ant-design/agentic-ui';
import React from 'react';

export default () => {
  const [value, setValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [focusCount, setFocusCount] = React.useState(0);

  return (
    <div style={{ padding: 20 }}>
      <h3>MarkdownInputField onFocus 功能演示</h3>

      <div style={{ marginBottom: 16 }}>
        <p>
          当前焦点状态:{' '}
          <strong>{isFocused ? '已获得焦点' : '未获得焦点'}</strong>
        </p>
        <p>
          焦点次数: <strong>{focusCount}</strong>
        </p>
      </div>

      <MarkdownInputField
        value={value}
        onChange={setValue}
        placeholder="点击输入框获得焦点..."
        onFocus={(value, schema) => {
          console.log('输入框获得焦点:', { value, schema });
          setIsFocused(true);
          setFocusCount((prev) => prev + 1);
        }}
        onSend={async (text) => {
          console.log('发送内容:', text);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }}
      />

      <div style={{ marginTop: 16 }}>
        <h4>功能说明</h4>
        <ul>
          <li>
            <code>onFocus</code> - 当输入字段获得焦点时触发的回调函数
          </li>
          <li>
            <code>value</code> - 当前的 markdown 文本值
          </li>
          <li>
            <code>schema</code> - 当前的编辑器 schema
          </li>
        </ul>
      </div>
    </div>
  );
};
