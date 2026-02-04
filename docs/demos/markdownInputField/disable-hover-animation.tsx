import { MarkdownInputField } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

/**
 * 禁用 hover 动画示例
 */
const DisableHoverAnimationDemo: React.FC = () => {
  const [value, setValue] = useState(
    '试试将鼠标悬停在输入框上，看看是否有阴影动画效果...',
  );

  return (
    <div style={{ padding: '24px', maxWidth: '980px', margin: '0 auto' }}>
      <h3>默认启用 hover 动画</h3>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        placeholder="将鼠标悬停在这里，会看到阴影动画效果"
      />

      <h3 style={{ marginTop: '32px' }}>禁用 hover 动画</h3>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        placeholder="将鼠标悬停在这里，不会看到阴影动画效果"
        disableHoverAnimation={true}
      />
    </div>
  );
};

export default DisableHoverAnimationDemo;
