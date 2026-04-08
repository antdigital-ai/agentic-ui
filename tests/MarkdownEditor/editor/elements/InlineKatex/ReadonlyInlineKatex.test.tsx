import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyInlineKatex } from '../../../../../src/MarkdownEditor/editor/elements/InlineKatex/ReadonlyInlineKatex';

describe('ReadonlyInlineKatex', () => {
  it('应渲染只读行内公式为 code 元素', () => {
    const props = {
      element: { type: 'inline-katex' as const, value: 'E=mc^2', children: [{ text: '' }] },
      attributes: {},
      children: <span />,
    } as any;
    const { container } = render(<ReadonlyInlineKatex {...props} />);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('E=mc^2');
  });
});
