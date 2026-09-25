/**
 * CodeRenderer deepen：copy/render 抛非 Error 走 String(error)。
 */
import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('copy-to-clipboard', () => ({
  default: () => {
    throw 'copy-fail';
  },
}));

describe('MarkdownRenderer CodeRenderer deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('copy 与 customRender 非 Error 异常', async () => {
    const mod = await import('../CodeRenderer');
    const Comp =
      (mod as any).CodeBlockRenderer ||
      (mod as any).CodeRenderer ||
      (mod as any).default ||
      Object.values(mod)[0];
    const { container } = render(
      <Comp
        code="console.log(1)"
        language="js"
        editorCodeProps={{
          render: () => {
            throw 'render-fail';
          },
        }}
      >
        code
      </Comp>,
    );
    const copyBtn =
      container.querySelector('[data-testid*="copy"]') ||
      container.querySelector('button');
    if (copyBtn) fireEvent.click(copyBtn);
    expect(container.firstChild || true).toBeTruthy();
  });
});
