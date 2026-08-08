/**
 * ReadonlyTable deepen：copy html/csv/md、无 actions、fullscreen Modal、空 children。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyTableComponent } from '../ReadonlyTableComponent';
import * as editorStore from '../../../store';

vi.mock('../../../store');
vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));
vi.mock('../../../utils', () => ({
  parserSlateNodeToMarkdown: vi.fn(() => '| a |\n| - |\n| b |'),
}));
vi.mock('../../../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" data-testid="action" title={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

const tableElement = {
  type: 'table',
  children: [
    {
      type: 'table-row',
      children: [
        {
          type: 'table-cell',
          children: [{ type: 'paragraph', children: [{ text: 'A' }] }],
        },
      ],
    },
  ],
  otherProps: {
    columns: [{ title: 'Col' }],
    dataSource: [{ Col: 'v1' }],
  },
};

describe('ReadonlyTableComponent deepen residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        tableConfig: {
          actions: { copy: 'md', fullScreen: 'modal' },
          previewTitle: 'Preview T',
        },
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderTable = (element: any = tableElement) =>
    render(
      <ConfigProvider>
        <ReadonlyTableComponent
          element={element as any}
          baseCls="md-table"
        >
          <tr>
            <td>A</td>
          </tr>
        </ReadonlyTableComponent>
      </ConfigProvider>,
    );

  it('copy md / html / csv；csv 无 columns 跳过', () => {
    renderTable();
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalled();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: { tableConfig: { actions: { copy: 'html' } } },
    } as any);
    cleanup();
    renderTable();
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalled();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: { tableConfig: { actions: { copy: 'csv' } } },
    } as any);
    cleanup();
    renderTable();
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('Col'));

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: { tableConfig: { actions: { copy: 'csv' } } },
    } as any);
    cleanup();
    renderTable({
      ...tableElement,
      otherProps: {},
    });
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalled();
  });

  it('fullscreen 打开 Modal；无 fullScreen/copy；空 children；pure', async () => {
    renderTable();
    fireEvent.click(screen.getByTitle('全屏'));
    expect(await screen.findByText('Preview T')).toBeInTheDocument();

    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        tableConfig: {
          actions: { copy: false, fullScreen: false },
          pure: true,
        },
      },
    } as any);
    cleanup();
    renderTable({ type: 'table', children: [] });
    expect(document.querySelector('table')).toBeTruthy();
    expect(screen.queryByTitle('全屏')).toBeNull();
    expect(screen.queryByTitle('复制')).toBeNull();
  });

  it('copy 抛错被捕获', () => {
    vi.mocked(copy).mockImplementation(() => {
      throw new Error('copy fail');
    });
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderTable();
    fireEvent.click(screen.getByTitle('复制'));
    expect(err).toHaveBeenCalled();
    err.mockRestore();
  });
});
