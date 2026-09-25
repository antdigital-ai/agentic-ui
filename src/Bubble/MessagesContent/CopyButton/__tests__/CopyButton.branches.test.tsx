import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CopyButton, CopyIcon } from '../index';

vi.mock('../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title, ...props }: any) => (
    <button type="button" {...props} onClick={onClick} data-title={typeof title === 'string' ? title : 'copied'}>
      {children(false)}
    </button>
  ),
}));
vi.mock('../../../../Hooks/useCopied', () => ({ useCopied: () => ({ copied: true, setCopied: vi.fn() }) }));

describe('CopyButton residual branches', () => {
  it('renders default icon and awaits optional click handlers', async () => {
    const onClick = vi.fn();
    render(<CopyButton data-testid="copy" onClick={onClick} />);
    fireEvent.click(screen.getByTestId('copy'));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });

  it('renders function and node children', () => {
    const { rerender } = render(<CopyButton>{(hovered) => <span>{String(hovered)}</span>}</CopyButton>);
    expect(screen.getByText('false')).toBeInTheDocument();
    rerender(<CopyButton><span>custom</span></CopyButton>);
    expect(screen.getByText('custom')).toBeInTheDocument();
    expect(render(<CopyIcon aria-label="copy" />).getByLabelText('copy')).toBeInTheDocument();
  });
});
