import { SandboxRenderer } from '@ant-design/agentic-ui';
import React from 'react';

// 模拟 coding agent 返回的可视化卡片代码
const AGENT_CARD_CODE = `
  const style = document.createElement('style');
  style.textContent = \`
    .card {
      padding: 24px 32px;
      border-radius: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-family: system-ui, sans-serif;
      text-align: center;
    }
    .card h2 { margin: 0 0 8px; }
    .card p { margin: 0; opacity: 0.85; }
    .card button {
      margin-top: 16px;
      padding: 8px 24px;
      border: none;
      border-radius: 8px;
      background: rgba(255,255,255,0.25);
      color: #fff;
      cursor: pointer;
      font-size: 14px;
    }
    .card button:hover { background: rgba(255,255,255,0.4); }
  \`;
  shadowRoot.appendChild(style);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = \`
    <h2>Agent 生成的卡片</h2>
    <p>这段 UI 由沙箱中的代码渲染，点击计数正常工作</p>
    <button id="counter">点击 0 次</button>
  \`;
  shadowRoot.appendChild(card);

  let count = 0;
  card.querySelector('#counter').addEventListener('click', (e) => {
    count++;
    e.target.textContent = \`点击 \${count} 次\`;
  });

  return 'rendered';
`;

const SandboxRendererBasicDemo: React.FC = () => (
  <SandboxRenderer code={AGENT_CARD_CODE} height={280} />
);

export default SandboxRendererBasicDemo;
