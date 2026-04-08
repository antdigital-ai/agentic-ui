import { MarkdownInputField } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

/**
 * E2E：放大/缩小快捷操作（需 enlargeable.enable）
 */
export default () => {
  const [value, setValue] = useState('');

  return (
    <div style={{ padding: 24 }}>
      <MarkdownInputField
        value={value}
        onChange={setValue}
        enlargeable={{ enable: true }}
        placeholder="E2E 放大按钮"
        onSend={async () => {}}
      />
    </div>
  );
};
