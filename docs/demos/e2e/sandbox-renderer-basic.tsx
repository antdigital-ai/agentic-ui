import { SandboxRenderer } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const CARD_CODE = `
  const style = document.createElement('style');
  style.textContent = [
    '.e2e-card { padding: 24px; text-align: center; font-family: system-ui, sans-serif; }',
    '.e2e-card h2 { margin: 0 0 8px; }',
    '.e2e-card button { padding: 8px 24px; border: none; border-radius: 8px; cursor: pointer; }',
  ].join('\\n');
  shadowRoot.appendChild(style);

  const card = document.createElement('div');
  card.className = 'e2e-card';
  card.innerHTML =
    '<h2 id="e2e-title">Sandbox Rendered</h2><button id="e2e-btn">Click 0</button>';
  shadowRoot.appendChild(card);

  let count = 0;
  card.querySelector('#e2e-btn').addEventListener('click', (e) => {
    count++;
    e.target.textContent = 'Click ' + count;
  });

  // 作用域探测：body 被拦截（undefined）、查询限定在容器内
  const scopedProbe = {
    bodyBlocked: document.body === undefined,
    titleInScope: !!document.getElementById('e2e-title'),
    children: shadowRoot.children.length,
  };

  return 'rendered:' + JSON.stringify(scopedProbe);
`;

/**
 * E2E SandboxRenderer：验证 agent 生成代码在沙箱内真实渲染、交互与作用域隔离（#330）
 */
export default () => {
  const [result, setResult] = useState('');

  return (
    <div>
      <SandboxRenderer
        code={CARD_CODE}
        height={200}
        onExecute={(r) => setResult(String(r))}
      />
      <p data-testid="e2e-sandbox-result">{result}</p>
    </div>
  );
};
