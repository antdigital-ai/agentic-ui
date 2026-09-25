import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SandboxRenderer } from '..';

describe('SandboxRenderer', () => {
  it('应渲染挂载容器并默认等待执行', () => {
    const { container } = render(
      <ConfigProvider>
        <SandboxRenderer code="return 1" />
      </ConfigProvider>,
    );

    const host = container.querySelector(
      '[class*="sandbox-renderer-host"]',
    );
    expect(host).toBeInTheDocument();
  });

  it('应执行 agent 生成的 DOM 代码并渲染到 shadowRoot', async () => {
    const code = `
      const title = document.createElement('h2');
      title.textContent = 'Agent Generated';
      shadowRoot.appendChild(title);
      return 'ok';
    `;

    const onExecute = vi.fn();
    const { container } = render(
      <ConfigProvider>
        <SandboxRenderer code={code} onExecute={onExecute} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(onExecute).toHaveBeenCalledWith('ok');
    });

    const host = container.querySelector('[class*="sandbox-renderer-host"]');
    const shadowRoot = host?.shadowRoot;
    expect(shadowRoot?.querySelector('h2')?.textContent).toBe(
      'Agent Generated',
    );
  });

  it('应通过 document.querySelector 在作用域内查询节点', async () => {
    const code = `
      const div = document.createElement('div');
      div.id = 'scoped-target';
      shadowRoot.appendChild(div);
      const found = document.getElementById('scoped-target');
      return found ? found.id : 'not-found';
    `;

    const onExecute = vi.fn();
    render(
      <ConfigProvider>
        <SandboxRenderer code={code} onExecute={onExecute} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(onExecute).toHaveBeenCalledWith('scoped-target');
    });
  });

  it('code 变化时应清空 shadowRoot 并重新执行', async () => {
    const { rerender } = render(
      <ConfigProvider>
        <SandboxRenderer code="shadowRoot.appendChild(document.createElement('span'));" />
      </ConfigProvider>,
    );

    await waitFor(() =>
      expect(
        document.querySelector('[class*="sandbox-renderer-host"]')?.shadowRoot
          ?.childElementCount,
      ).toBe(1),
    );

    rerender(
      <ConfigProvider>
        <SandboxRenderer
          code={'shadowRoot.appendChild(document.createElement("p"));'}
        />
      </ConfigProvider>,
    );

    await waitFor(() => {
      const shadowRoot = document.querySelector(
        '[class*="sandbox-renderer-host"]',
      )?.shadowRoot;
      expect(shadowRoot?.childElementCount).toBe(1);
      expect(shadowRoot?.querySelector('p')).toBeInTheDocument();
    });
  });

  it('执行失败时应显示错误并回调 onError', async () => {
    const onError = vi.fn();
    render(
      <ConfigProvider>
        <SandboxRenderer code="throw new Error('boom');" onError={onError} />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });

    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it('注入的 globals 应可在代码内访问', async () => {
    const onExecute = vi.fn();
    render(
      <ConfigProvider>
        <SandboxRenderer
          code="return [a, b].join('-');"
          globals={{ a: 'hello', b: 'sandbox' }}
          onExecute={onExecute}
        />
      </ConfigProvider>,
    );

    await waitFor(() => {
      expect(onExecute).toHaveBeenCalledWith('hello-sandbox');
    });
  });
});
