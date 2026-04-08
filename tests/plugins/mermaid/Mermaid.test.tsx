import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Mermaid } from '../../../src/Plugins/mermaid/Mermaid';

vi.mock('../../../src/Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

vi.mock('../../../src/Plugins/mermaid/env', () => ({
  isBrowser: vi.fn(() => true),
}));

vi.mock('mermaid', () => ({
  default: {
    render: vi.fn().mockResolvedValue({ svg: '<svg>test</svg>' }),
    parse: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('react-use', () => ({
  useGetSetState: vi.fn((initialState) => {
    let state = { ...initialState };
    const setState = vi.fn((update) => {
      if (typeof update === 'function') {
        state = { ...state, ...update(state) };
      } else {
        state = { ...state, ...update };
      }
    });
    const getState = vi.fn(() => state);
    return [getState, setState];
  }),
}));

describe('Mermaid Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultElement = {
    type: 'code' as const,
    language: 'mermaid',
    value: 'graph TD\nA[开始] --> B[结束]',
    children: [{ text: '' }] as [{ text: string }],
  };

  const renderMermaid = (overrides: Partial<typeof defaultElement> = {}) =>
    render(<Mermaid element={{ ...defaultElement, ...overrides }} />);

  it('非浏览器环境（isBrowser 为 false）时应 return null', async () => {
    const { isBrowser } = await import('../../../src/Plugins/mermaid/env');
    vi.mocked(isBrowser).mockReturnValueOnce(false);

    const { container } = render(<Mermaid element={{ ...defaultElement }} />);
    expect(container.firstChild).toBeNull();
  });

  it('挂载后应调用 mermaid.render（默认代码）', async () => {
    const mermaid = await import('mermaid');
    renderMermaid();
    await waitFor(() => {
      expect(mermaid.default.render).toHaveBeenCalled();
    });
  });

  it('空内容展示空态且不调用 mermaid.render', async () => {
    const mermaid = await import('mermaid');
    renderMermaid({ value: '' });
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-mermaid-empty'),
      ).toBeInTheDocument();
    });
    expect(mermaid.default.render).not.toHaveBeenCalled();
  });

  it('复杂代码与非法代码仍会走 mermaid.render', async () => {
    const mermaid = await import('mermaid');
    const complexCode = `
        graph TD
        A[开始] --> B{判断}
        B -->|是| C[执行]
        B -->|否| D[跳过]
        C --> E[结束]
        D --> E
      `;

    const { rerender } = renderMermaid();
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());

    vi.clearAllMocks();
    rerender(
      <Mermaid element={{ ...defaultElement, value: 'invalid mermaid code' }} />,
    );
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());

    vi.clearAllMocks();
    rerender(<Mermaid element={{ ...defaultElement, value: complexCode }} />);
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());
  });

  it('null/undefined value 与空字符串同属空态', async () => {
    const mermaid = await import('mermaid');
    const { rerender } = render(
      <Mermaid element={{ ...defaultElement, value: undefined as any }} />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-mermaid-empty'),
      ).toBeInTheDocument();
    });
    expect(mermaid.default.render).not.toHaveBeenCalled();

    rerender(<Mermaid element={{ ...defaultElement, value: null as any }} />);
    await waitFor(() => {
      expect(
        document.querySelector('.ant-agentic-plugin-mermaid-empty'),
      ).toBeInTheDocument();
    });
  });

  it('应使用 setTimeout 进行防抖', () => {
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    renderMermaid();
    expect(setTimeoutSpy).toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  it('应在组件卸载时清理定时器', () => {
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const { unmount } = renderMermaid();
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('快速更新 element.value 后仍应调用 render', async () => {
    const mermaid = await import('mermaid');
    const { rerender } = renderMermaid();
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());

    vi.clearAllMocks();
    rerender(
      <Mermaid
        element={{
          ...defaultElement,
          value: 'graph TD\nB[新代码] --> C[结束]',
        }}
      />,
    );
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());
  });

  it('otherProps.finished === false 时不应渲染图表，展示原始代码', async () => {
    const mermaid = await import('mermaid');
    const { container } = render(
      <Mermaid
        element={{
          ...defaultElement,
          otherProps: { finished: false },
        }}
      />,
    );
    expect(mermaid.default.render).not.toHaveBeenCalled();
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre?.textContent).toBe(defaultElement.value);
  });

  it('otherProps.finished 不为 false 时正常渲染图表', async () => {
    const mermaid = await import('mermaid');
    renderMermaid();
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());
  });

  it('otherProps.finished 从 false 变为 undefined 后应开始渲染', async () => {
    const mermaid = await import('mermaid');
    const { rerender } = render(
      <Mermaid
        element={{
          ...defaultElement,
          otherProps: { finished: false },
        }}
      />,
    );
    expect(mermaid.default.render).not.toHaveBeenCalled();

    rerender(
      <Mermaid
        element={{
          ...defaultElement,
          otherProps: {},
        }}
      />,
    );
    await waitFor(() => expect(mermaid.default.render).toHaveBeenCalled());
  });
});
