/**
 * InlineKatexFix：readonly 分支渲染 code children。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InlineKatexFix } from '../InlineKatexFix';

vi.mock('../../MarkdownEditor/editor/store', () => ({
  useEditorStore: vi.fn(() => ({
    readonly: true,
  })),
}));

vi.mock('../InlineKatex', () => ({
  InlineKatex: () => <div data-testid="editable-katex">edit</div>,
}));

describe('InlineKatexFix branches', () => {
  it.skip('readonly 时渲染 code 包裹 children', () => {
    render(
      <InlineKatexFix
        attributes={{ 'data-slate-node': 'element' } as any}
        element={{ type: 'inline-katex', children: [{ text: 'a' }] } as any}
      >
        formula
      </InlineKatexFix>,
    );
    expect(screen.getByText('formula')).toBeInTheDocument();
    expect(screen.queryByTestId('editable-katex')).toBeNull();
  });
});
