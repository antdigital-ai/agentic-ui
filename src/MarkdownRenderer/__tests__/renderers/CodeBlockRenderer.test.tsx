import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockRenderer } from '../../renderers/CodeRenderer';

const copyMock = vi.fn();
const focusMock = vi.fn();

vi.mock('copy-to-clipboard', () => ({
  default: (...args: unknown[]) => copyMock(...args),
}));

vi.mock('../../../Plugins/chart/hooks', () => ({
  useDetectTheme: vi.fn(() => 'light'),
}));

vi.mock('../../../Plugins/code/components/CodeContainer', () => ({
  CodeContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="code-container">{children}</div>
  ),
}));

vi.mock('../../renderers/CodeBlockToolbar', () => ({
  CodeBlockToolbar: ({
    onCopy,
    onToggleExpanded,
    expanded,
  }: {
    onCopy: () => void;
    onToggleExpanded: () => void;
    expanded: boolean;
  }) => (
    <div data-testid="code-toolbar">
      <button type="button" onClick={onCopy}>
        copy
      </button>
      <button
        type="button"
        data-expanded={String(expanded)}
        onClick={onToggleExpanded}
      >
        toggle
      </button>
    </div>
  ),
}));

describe('CodeBlockRenderer', () => {
  beforeEach(() => {
    copyMock.mockReset();
    focusMock.mockReset();
  });

  it('renders code content and copies on toolbar action', () => {
    render(
      <CodeBlockRenderer language="typescript">
        {'const x = 1;'}
      </CodeBlockRenderer>,
    );

    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'copy' }));
    expect(copyMock).toHaveBeenCalledWith('const x = 1;');
  });

  it('toggles expanded state when collapse button is clicked', () => {
    render(<CodeBlockRenderer language="json">{'{}'}</CodeBlockRenderer>);

    const content = document.querySelector(
      '.code-editor-content',
    ) as HTMLElement;
    expect(content.style.display).toBe('block');

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    expect(content.style.display).toBe('none');
  });

  it('uses custom editorCodeProps.render when provided', () => {
    const customRender = vi.fn((_props, defaultDom) => (
      <div data-testid="custom-code">{defaultDom}</div>
    ));

    render(
      <CodeBlockRenderer
        language="js"
        editorCodeProps={{ render: customRender }}
      >
        {'hello'}
      </CodeBlockRenderer>,
    );

    expect(screen.getByTestId('custom-code')).toBeInTheDocument();
    expect(customRender).toHaveBeenCalled();
  });

  it('falls back to default dom when custom render returns undefined', () => {
    const customRender = vi.fn(() => undefined);

    render(
      <CodeBlockRenderer
        language="js"
        editorCodeProps={{ render: customRender }}
      >
        {'fallback'}
      </CodeBlockRenderer>,
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
  });

  it('falls back to default dom when custom render throws', () => {
    const customRender = vi.fn(() => {
      throw new Error('render failed');
    });

    render(
      <CodeBlockRenderer
        language="js"
        editorCodeProps={{ render: customRender }}
      >
        {'safe'}
      </CodeBlockRenderer>,
    );

    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('swallows copy failures', () => {
    copyMock.mockImplementation(() => {
      throw new Error('copy failed');
    });

    render(<CodeBlockRenderer language="txt">{'data'}</CodeBlockRenderer>);
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'copy' })),
    ).not.toThrow();
  });
});
