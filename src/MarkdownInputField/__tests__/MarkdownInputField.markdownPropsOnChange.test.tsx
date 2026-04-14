import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../MarkdownEditor', () => ({
  BaseMarkdownEditor: vi.fn(({ onChange }) => (
    <button
      type="button"
      data-testid="mock-markdown-editor"
      onClick={() => onChange?.('synced', [])}
    >
      trigger-change
    </button>
  )),
}));

import { MarkdownInputField } from '../MarkdownInputField';

describe('MarkdownInputField — markdownProps.onChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges markdownProps.onChange with the field handler (no spread override)', () => {
    const fieldOnChange = vi.fn();
    const markdownPropsOnChange = vi.fn();

    render(
      <MarkdownInputField
        onChange={fieldOnChange}
        markdownProps={{ onChange: markdownPropsOnChange }}
      />,
    );

    screen.getByTestId('mock-markdown-editor').click();

    expect(fieldOnChange).toHaveBeenCalledTimes(1);
    expect(markdownPropsOnChange).toHaveBeenCalledTimes(1);
    expect(fieldOnChange).toHaveBeenCalledWith('synced');
    expect(markdownPropsOnChange).toHaveBeenCalledWith('synced', []);
  });
});
