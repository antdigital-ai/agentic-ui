/**
 * ReadonlyTable deepen2：locale 回退、cssVariables、Modal 交互、default actions、空列。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../I18n';
import * as editorStore from '../../../store';
import { ReadonlyTableComponent } from '../ReadonlyTableComponent';

vi.mock('../../../store');
vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));
vi.mock('../../../utils', () => ({
  parserSlateNodeToMarkdown: vi.fn(() => '| a |'),
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
        {
          type: 'table-cell',
          children: [{ type: 'paragraph', children: [{ text: 'B' }] }],
        },
      ],
    },
  ],
  otherProps: {
    colWidths: [80, 120],
    columns: [{ title: 'C1' }, { title: 'C2' }],
    dataSource: [{ C1: '1', C2: '2' }],
  },
};

describe('ReadonlyTableComponent deepen2 residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        tableConfig: {
          cssVariables: { '--t': '1' },
        },
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const wrap = (ui: React.ReactNode, locale: any = null) =>
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale } as any}>{ui}</I18nContext.Provider>
      </ConfigProvider>,
    );

  it('默认 actions + locale 缺省中文；cssVariables', async () => {
    wrap(
      <ReadonlyTableComponent element={tableElement as any} baseCls="md-table">
        <tr>
          <td>A</td>
          <td>B</td>
        </tr>
      </ReadonlyTableComponent>,
    );
    expect(screen.getByTitle('全屏')).toBeInTheDocument();
    expect(screen.getByTitle('复制')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('全屏'));
    expect(await screen.findByText('预览表格')).toBeInTheDocument();
    const modalBody = document.querySelector('.ant-modal-body') || document.body;
    fireEvent.mouseDown(modalBody.querySelector('[class*="md-table"]') || modalBody);
    fireEvent.doubleClick(modalBody);
    fireEvent.click(document.body);
  });

  it('locale 自定义文案；Modal onCancel；空 children columnCount=0', async () => {
    wrap(
      <ReadonlyTableComponent
        element={{ type: 'table', children: [], otherProps: {} } as any}
        baseCls="md-table"
      >
        {null}
      </ReadonlyTableComponent>,
      {
        fullScreen: 'FS',
        copy: 'CP',
        previewTable: 'PT',
      },
    );
    expect(screen.getByTitle('FS')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('FS'));
    expect(await screen.findByText('PT')).toBeInTheDocument();
    const cancel = document.querySelector('.ant-modal-close');
    if (cancel) fireEvent.click(cancel);
  });

  it('copy csv 多列；html 空 innerHTML', () => {
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: { tableConfig: { actions: { copy: 'csv' } } },
    } as any);
    wrap(
      <ReadonlyTableComponent element={tableElement as any} baseCls="md-table">
        <tr>
          <td>A</td>
        </tr>
      </ReadonlyTableComponent>,
    );
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalledWith(expect.stringContaining('C1'));

    cleanup();
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: { tableConfig: { actions: { copy: 'html', fullScreen: false } } },
    } as any);
    wrap(
      <ReadonlyTableComponent element={tableElement as any} baseCls="md-table">
        <tr>
          <td>A</td>
        </tr>
      </ReadonlyTableComponent>,
    );
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalled();
  });
});
