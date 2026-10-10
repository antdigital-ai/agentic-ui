import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import MarkdownRenderer from '../MarkdownRenderer';
import type { MarkdownRendererTableConfig } from '../types';

const table = '| Name | Value |\n| --- | --- |\n| Alpha | One |';
const config: MarkdownRendererTableConfig = {
  actions: { fullScreen: 'modal' },
  previewTitle: 'Table preview',
};

afterEach(cleanup);

describe('MarkdownRenderer lightweight table preview', () => {
  it('mounts actions and the preview on interaction and releases the preview on close', () => {
    const { container } = render(
      <MarkdownRenderer content={table} tableConfig={config} />,
    );
    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(screen.queryByTestId('markdown-table-fullscreen')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.querySelector('[data-slate-editor]')).toBeNull();

    const nativeTable = container.querySelector('table');
    fireEvent.mouseEnter(nativeTable!.parentElement!);
    fireEvent.click(screen.getByTestId('markdown-table-fullscreen'));
    const preview = screen.getByRole('dialog');
    expect(within(preview).getByText('Table preview')).toBeTruthy();
    expect(within(preview).getByText('Alpha')).toBeTruthy();
    expect(container.querySelector('table')).toBe(nativeTable);
    expect(document.querySelector('[data-slate-editor]')).toBeNull();

    fireEvent.click(within(preview).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(container.querySelector('table')).toBe(nativeTable);
  });

  it('supports keyboard focus and drawer previews', () => {
    const { container } = render(
      <MarkdownRenderer
        content={table}
        tableConfig={{ actions: { fullScreen: 'drawer' } }}
      />,
    );
    const tableContainer = container.querySelector('table')!.parentElement!;
    expect(tableContainer.tabIndex).toBe(0);
    fireEvent.focus(tableContainer);
    fireEvent.click(screen.getByTestId('markdown-table-fullscreen'));
    expect(within(screen.getByRole('dialog')).getByText('One')).toBeTruthy();
  });

  it('applies updated preview configuration without replacing an open table', () => {
    const { container, rerender } = render(
      <MarkdownRenderer content={table} tableConfig={config} />,
    );
    const nativeTable = container.querySelector('table');
    fireEvent.mouseEnter(nativeTable!.parentElement!);
    fireEvent.click(screen.getByTestId('markdown-table-fullscreen'));
    rerender(
      <MarkdownRenderer
        content={table}
        tableConfig={{ ...config, previewTitle: 'Updated title' }}
      />,
    );
    expect(container.querySelector('table')).toBe(nativeTable);
    expect(
      within(screen.getByRole('dialog')).getByText('Updated title'),
    ).toBeTruthy();
  });

  it('keeps the native table and open preview while appending streamed content', () => {
    const { container, rerender } = render(
      <MarkdownRenderer
        content={table}
        tableConfig={config}
        streaming
        throttleOptions={{ enabled: false, fade: false }}
      />,
    );
    const nativeTable = container.querySelector('table');
    fireEvent.mouseEnter(nativeTable!.parentElement!);
    fireEvent.click(screen.getByTestId('markdown-table-fullscreen'));
    rerender(
      <MarkdownRenderer
        content={`${table}\n| Beta | Two |\n\nMore text`}
        tableConfig={config}
        streaming
        throttleOptions={{ enabled: false, fade: false }}
      />,
    );
    expect(container.querySelector('table')).toBe(nativeTable);
    expect(within(screen.getByRole('dialog')).getByText('Beta')).toBeTruthy();
  });

  it('retains eleRender interception and plugin table precedence', () => {
    const { container, rerender } = render(
      <MarkdownRenderer
        content={table}
        tableConfig={config}
        eleRender={(props) => (props.tagName === 'table' ? null : undefined)}
      />,
    );
    expect(container.querySelector('table')).toBeNull();
    rerender(
      <MarkdownRenderer
        content={table}
        tableConfig={config}
        plugins={[
          {
            renderer: {
              rendererComponents: {
                table: () => <div data-testid="custom-table">Custom</div>,
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByTestId('custom-table')).toBeTruthy();
    expect(screen.queryByTestId('markdown-table')).toBeNull();
  });

  it('does not add action DOM to ordinary native tables', () => {
    const { container } = render(<MarkdownRenderer content={table} />);
    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(screen.queryByTestId('markdown-table-fullscreen')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
