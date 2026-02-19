import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ReadonlyKatex } from '../../../../../src/MarkdownEditor/editor/elements/Katex/ReadonlyKatex';

vi.mock('../../../../../src/Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

describe('ReadonlyKatex', () => {
  it('应渲染只读公式块并应用样式', () => {
    const element = { type: 'code', value: 'E = mc^2', children: [{ text: '' }] };
    const attributes = { 'data-slate-node': 'element', ref: React.createRef() };
    const { container } = render(
      <ReadonlyKatex element={element} attributes={attributes}>
        <span />
      </ReadonlyKatex>,
    );
    const pre = container.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveStyle({
      background: 'rgb(242, 241, 241)',
      color: 'rgb(27, 27, 27)',
    });
    expect(screen.getByText('E = mc^2')).toBeInTheDocument();
  });
});
