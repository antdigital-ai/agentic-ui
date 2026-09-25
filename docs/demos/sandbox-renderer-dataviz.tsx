import { SandboxRenderer } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const DATA_VIZ_CODE = `
  const data = [
    { label: 'Mon', value: 30 },
    { label: 'Tue', value: 80 },
    { label: 'Wed', value: 45 },
    { label: 'Thu', value: 60 },
    { label: 'Fri', value: 95 },
    { label: 'Sat', value: 20 },
    { label: 'Sun', value: 55 },
  ];
  const max = Math.max(...data.map((d) => d.value));

  const style = document.createElement('style');
  style.textContent = \`
    .chart { display: flex; align-items: flex-end; gap: 12px; height: 180px; padding: 16px; }
    .bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .bar-fill {
      width: 100%;
      border-radius: 4px 4px 0 0;
      background: linear-gradient(180deg, #4079ff, #3066fd);
      transition: height 0.4s ease;
    }
    .bar span { font-size: 12px; color: #555; }
  \`;
  shadowRoot.appendChild(style);

  const chart = document.createElement('div');
  chart.className = 'chart';
  data.forEach((d) => {
    const bar = document.createElement('div');
    bar.className = 'bar';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.height = (d.value / max) * 140 + 'px';
    const label = document.createElement('span');
    label.textContent = d.label;
    const value = document.createElement('span');
    value.textContent = d.value;
    bar.appendChild(fill);
    bar.appendChild(value);
    bar.appendChild(label);
    chart.appendChild(bar);
  });
  shadowRoot.appendChild(chart);

  return data.length;
`;

const SandboxRendererErrorDemo: React.FC = () => {
  const [result, setResult] = useState<string>('');

  return (
    <div>
      <SandboxRenderer
        code={DATA_VIZ_CODE}
        height={240}
        onExecute={(r) => setResult(`执行成功，返回值：${String(r)}`)}
      />
      <p style={{ marginTop: 8, fontSize: 13, color: '#666' }}>{result}</p>
    </div>
  );
};

export default SandboxRendererErrorDemo;
