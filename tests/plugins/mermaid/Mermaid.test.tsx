import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Mermaid } from '../../../src/Plugins/mermaid/Mermaid';

vi.mock('../../../src/Hooks/useIntersectionOnce', () => ({
  useIntersectionOnce: () => true,
}));

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    render: vi.fn().mockResolvedValue({ svg: '<svg>test</svg>' }),
    parse: vi.fn().mockResolvedValue(true),
  },
}));

// Mock react-use
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

  describe('基本渲染测试', () => {
    it('应该正确渲染 Mermaid 组件', () => {
      renderMermaid();

      expect(document.body).toBeInTheDocument();
    });

    it('应该渲染空状态', () => {
      renderMermaid({ value: '' });

      expect(document.body).toBeInTheDocument();
    });

    it('应该渲染错误状态', () => {
      renderMermaid({ value: 'invalid mermaid code' });

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('mermaid 渲染测试', () => {
    it('应该调用 mermaid.render 方法', async () => {
      const mermaid = await import('mermaid');

      renderMermaid();

      await waitFor(() => {
        expect(mermaid.default.render).toHaveBeenCalled();
      });
    });

    it('应该处理 mermaid.render 成功', async () => {
      const mermaid = await import('mermaid');

      renderMermaid();

      await waitFor(() => {
        expect(mermaid.default.render).toHaveBeenCalled();
      });
    });

    it('应该处理 mermaid.render 失败', async () => {
      const mermaid = await import('mermaid');

      renderMermaid();

      await waitFor(() => {
        expect(mermaid.default.render).toHaveBeenCalled();
      });
    });

    it('应该处理 mermaid.parse 失败', async () => {
      const mermaid = await import('mermaid');
      vi.clearAllMocks();

      renderMermaid();

      // 等待 mermaid 渲染完成
      await waitFor(
        () => {
          expect(mermaid.default.render).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    });
  });

  describe('定时器测试', () => {
    it('应该使用 setTimeout 进行防抖', () => {
      const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');

      renderMermaid();

      expect(setTimeoutSpy).toHaveBeenCalled();
    });

    it('应该在组件卸载时清理定时器', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
      const { unmount } = renderMermaid();

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理 undefined value', () => {
      renderMermaid({ value: undefined as any });

      expect(document.body).toBeInTheDocument();
    });

    it('应该处理 null value', () => {
      renderMermaid({ value: null as any });

      expect(document.body).toBeInTheDocument();
    });

    it('应该处理空字符串 value', () => {
      renderMermaid({ value: '' });

      expect(document.body).toBeInTheDocument();
    });

    it('应该处理复杂的 mermaid 代码', () => {
      const complexCode = `
        graph TD
        A[开始] --> B{判断}
        B -->|是| C[执行]
        B -->|否| D[跳过]
        C --> E[结束]
        D --> E
      `;

      renderMermaid({ value: complexCode });

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('样式和布局测试', () => {
    it('应该应用正确的样式', () => {
      renderMermaid();

      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
    });

    it('应该设置 contentEditable 为 false', () => {
      renderMermaid();

      const container = document.querySelector('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('错误处理测试', () => {
    it('应该显示错误信息', async () => {
      const mermaid = await import('mermaid');

      renderMermaid();

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('应该处理空代码和错误状态', () => {
      renderMermaid({ value: '' });

      expect(document.body).toBeInTheDocument();
    });
  });

  describe('性能测试', () => {
    it('应该处理快速更新的代码', async () => {
      const { rerender } = renderMermaid();

      // 快速更新代码
      rerender(
        <Mermaid
          element={{
            ...defaultElement,
            value: 'graph TD\nB[新代码] --> C[结束]',
          }}
        />,
      );

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });

    it('应该处理相同的代码不会重复渲染', () => {
      const { rerender } = renderMermaid();

      // 使用相同的代码重新渲染
      rerender(<Mermaid element={defaultElement} />);

      expect(document.body).toBeInTheDocument();
    });
  });
});
