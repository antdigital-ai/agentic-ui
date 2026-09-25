import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CodeContainer } from '../CodeContainer';

describe('CodeContainer residual branches', () => {
  it('uses safe element defaults when metadata is absent', () => {
    render(
      <CodeContainer showBorder={false} hide={false} onEditorClick={vi.fn()}>
        code
      </CodeContainer>,
    );
    expect(screen.getByTestId('code-container')).not.toHaveAttribute('data-lang');
  });

  it('stops clicks and reports editor clicks with visual flags', () => {
    const onEditorClick = vi.fn();
    render(
      <CodeContainer
        element={{ language: 'ts', frontmatter: true } as any}
        showBorder
        hide
        onEditorClick={onEditorClick}
      >
        code
      </CodeContainer>,
    );
    const editor = screen.getByTestId('code-editor-container');
    fireEvent.click(editor);

    expect(onEditorClick).toHaveBeenCalled();
    expect(editor).toHaveClass('code-editor-container--show-border');
    expect(editor).toHaveClass('code-editor-container--hide');
    expect(editor).toHaveAttribute('data-frontmatter', '');
  });
});
