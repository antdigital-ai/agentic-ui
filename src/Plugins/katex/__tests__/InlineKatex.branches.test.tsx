/**
 * InlineKatex：NODE_ENV === test 早退加载分支。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InlineKatex } from '../InlineKatex';

vi.mock('../../MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: { current: null },
    readonly: false,
  })),
}));

vi.mock('../../MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, [0]]),
}));

vi.mock('../loadKatex', () => ({
  loadKatex: vi.fn(() => Promise.reject(new Error('should not load in test'))),
}));

describe('InlineKatex branches', () => {
  it.skip('测试环境不调用 loadKatex 且可渲染', () => {
    const { container } = render(
      <InlineKatex
        attributes={{ 'data-slate-node': 'element' } as any}
        element={{ type: 'inline-katex', children: [{ text: 'x' }] } as any}
      >
        x
      </InlineKatex>,
    );
    expect(container.textContent).toContain('x');
  });
});
