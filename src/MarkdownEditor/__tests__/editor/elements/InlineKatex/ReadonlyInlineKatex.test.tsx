import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyInlineKatex } from '../../../../editor/elements/InlineKatex/ReadonlyInlineKatex';

describe('ReadonlyInlineKatex', () => {
  it('应渲染只读行内公式为 code 元素且仅输出一次文本', () => {
    const props = {
      element: {
        type: 'inline-katex' as const,
        children: [{ text: 'E=mc^2' }],
      },
      attributes: {},
      children: <>E=mc^2</>,
    } as any;
    const { container } = render(<ReadonlyInlineKatex {...props} />);
    const code = container.querySelector('code');
    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('E=mc^2');
    expect(code?.textContent).toBe('E=mc^2');
  });
});
