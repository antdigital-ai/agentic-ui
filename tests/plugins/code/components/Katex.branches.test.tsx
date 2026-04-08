/**
 * Katex 组件分支覆盖补充测试
 *
 * 覆盖异步加载路径、setTimeout 回调、katex.render 调用、
 * 空代码 else 分支、清理函数等在 test 环境下未执行的路径。
 */
import '@testing-library/jest-dom';
import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ---------- hoisted mocks ---------- */
const mockRender = vi.fn();
const mockLoadKatex = vi.fn();

vi.mock('../../../../src/Plugins/katex/loadKatex', () => ({
  loadKatex: () => mockLoadKatex(),
}));

import { Katex } from '../../../../src/Plugins/code/CodeUI/Katex/Katex';

describe('Katex 分支覆盖', () => {
  let origEnv: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    origEnv = process.env.NODE_ENV;
    mockRender.mockImplementation(() => {});
    mockLoadKatex.mockResolvedValue({ default: { render: mockRender } });
  });

  afterEach(() => {
    process.env.NODE_ENV = origEnv;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  /** 辅助：等待微任务队列清空 */
  const flushMicrotasks = async (n = 5) => {
    for (let i = 0; i < n; i++) {
      await Promise.resolve();
    }
  };

  /* ====== 异步加载成功路径 ====== */

  it('非 test 环境下通过 startTransition 异步加载 katex', async () => {
    process.env.NODE_ENV = 'development';

    render(
      <Katex
        el={{
          type: 'code',
          value: 'E=mc^2',
          children: [{ text: '' }],
        }}
      />,
    );

    // 等待异步加载完成
    await act(async () => {
      await flushMicrotasks();
    });

    expect(mockLoadKatex).toHaveBeenCalledTimes(1);
  });

  /* ====== 异步加载失败路径 ====== */

  it('loadKatex 失败时打印错误并仍然设置 katexLoaded', async () => {
    process.env.NODE_ENV = 'development';
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLoadKatex.mockRejectedValueOnce(new Error('network'));

    render(
      <Katex
        el={{
          type: 'code',
          value: 'x',
          children: [{ text: '' }],
        }}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to load Katex:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  /* ====== 第二个 useEffect：有公式时调用 katex.render ====== */

  it('加载成功后 setTimeout 回调执行 katex.render', async () => {
    process.env.NODE_ENV = 'development';

    const { container } = render(
      <Katex
        el={{
          type: 'code',
          value: 'a^2+b^2=c^2',
          children: [{ text: '' }],
        }}
      />,
    );

    // 等待加载完成
    await act(async () => {
      await flushMicrotasks();
    });

    // 第一次 setTimeout 延迟 0ms（state().code 为空）
    await act(async () => {
      vi.advanceTimersByTime(0);
      await flushMicrotasks();
    });

    // 第二次 setTimeout 延迟 300ms（state().code 已有值）
    await act(async () => {
      vi.advanceTimersByTime(350);
      await flushMicrotasks();
    });

    // 验证 katex.render 被调用
    expect(mockRender).toHaveBeenCalled();
    const divRef = container.querySelector('.katex-container');
    expect(divRef).toBeInTheDocument();
  });

  /* ====== 空代码 else 分支（setState({ error: '' })） ====== */

  it('代码为空时走 else 分支清除 error', async () => {
    process.env.NODE_ENV = 'development';

    render(
      <Katex
        el={{
          type: 'code',
          value: '',
          children: [{ text: '' }],
        }}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    // 延迟 0ms
    await act(async () => {
      vi.advanceTimersByTime(0);
      await flushMicrotasks();
    });

    // 空代码不调用 render
    expect(mockRender).not.toHaveBeenCalled();
  });

  /* ====== katex.render 抛出异常 catch 分支 ====== */

  it('katex.render 抛出异常时不崩溃', async () => {
    process.env.NODE_ENV = 'development';
    mockRender.mockImplementation(() => {
      throw new Error('KaTeX parse error');
    });

    const { container } = render(
      <Katex
        el={{
          type: 'code',
          value: 'broken\\formula',
          children: [{ text: '' }],
        }}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    await act(async () => {
      vi.advanceTimersByTime(0);
      await flushMicrotasks();
    });

    await act(async () => {
      vi.advanceTimersByTime(350);
      await flushMicrotasks();
    });

    expect(container.firstChild).toBeInTheDocument();
  });

  /* ====== cleanup 函数 clearTimeout ====== */

  it('组件卸载时清理 setTimeout', async () => {
    process.env.NODE_ENV = 'development';
    const clearSpy = vi.spyOn(window, 'clearTimeout');

    const { unmount } = render(
      <Katex
        el={{
          type: 'code',
          value: 'x',
          children: [{ text: '' }],
        }}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    unmount();

    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  /* ====== rerender 触发 clearTimeout 后重新 setTimeout ====== */

  it('props 变化时清除旧定时器、创建新定时器', async () => {
    process.env.NODE_ENV = 'development';

    const { rerender } = render(
      <Katex
        el={{
          type: 'code',
          value: 'a',
          children: [{ text: '' }],
        }}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    // 重新渲染触发清除旧定时器
    await act(async () => {
      rerender(
        <Katex
          el={{
            type: 'code',
            value: 'b',
            children: [{ text: '' }],
          }}
        />,
      );
    });

    await act(async () => {
      vi.advanceTimersByTime(350);
      await flushMicrotasks();
    });

    expect(mockLoadKatex).toHaveBeenCalled();
  });

  /* ====== katexRef.current 为 null 时不调用 render ====== */

  it('katexRef.current 为 null 时 setTimeout 回调不调用 render', async () => {
    process.env.NODE_ENV = 'development';
    mockLoadKatex.mockResolvedValueOnce({ default: null } as any);

    render(
      <Katex
        el={{
          type: 'code',
          value: 'x',
          children: [{ text: '' }],
        }}
      />,
    );

    await act(async () => {
      await flushMicrotasks();
    });

    await act(async () => {
      vi.advanceTimersByTime(350);
      await flushMicrotasks();
    });

    expect(mockRender).not.toHaveBeenCalled();
  });
});
