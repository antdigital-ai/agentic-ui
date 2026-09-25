/**
 * InlineKatexFix deepen：readonly true → code 早退臂。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({ readonly: true }),
  EditorStoreContext: React.createContext({ readonly: true }),
}));

vi.mock('../InlineKatex', () => ({
  InlineKatex: () => <span data-testid="inline-katex">katex</span>,
}));

import { InlineKatexFix } from '../InlineKatexFix';

describe('InlineKatexFix deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('readonly：渲染 code 而非 InlineKatex', () => {
    render(
      <InlineKatexFix
        element={{ type: 'inline-katex', children: [{ text: 'x' }] } as any}
        attributes={{ 'data-slate': '1' } as any}
      >
        x^2
      </InlineKatexFix>,
    );
    expect(screen.queryByTestId('inline-katex')).toBeNull();
    expect(screen.getByText('x^2')).toBeInTheDocument();
  });
});
