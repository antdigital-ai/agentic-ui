import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { InlineKatexFix } from '../InlineKatexFix';

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({ readonly: true })),
}));

describe('InlineKatexFix', () => {
  it('只读模式下应仅渲染 Slate children 一次', () => {
    const props = {
      element: {
        type: 'inline-katex' as const,
        children: [{ text: '$24.4B' }],
      },
      attributes: { 'data-testid': 'inline-katex-fix' },
      children: <>$24.4B</>,
    } as any;

    const { container } = render(<InlineKatexFix {...props} />);
    const code = container.querySelector('code');

    expect(code).toBeInTheDocument();
    expect(code).toHaveTextContent('$24.4B');
    expect(code?.textContent).toBe('$24.4B');
  });
});
