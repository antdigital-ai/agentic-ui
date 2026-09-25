/**
 * ReadonlyTable deepen3：copy csv 缺 columns、Modal container 回退。
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

const baseEl = {
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
};

describe('ReadonlyTableComponent deepen3 residual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        tableConfig: { actions: { copy: 'csv', fullScreen: true } },
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const wrap = (ui: React.ReactNode) =>
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {} } as any}>
          {ui}
        </I18nContext.Provider>
      </ConfigProvider>,
    );

  it('copy=csv：无 columns/dataSource 仍调用 copy', () => {
    wrap(
      <ReadonlyTableComponent
        element={{ ...baseEl, otherProps: {} } as any}
        baseCls="md-table"
      >
        <tr>
          <td>A</td>
        </tr>
      </ReadonlyTableComponent>,
    );
    fireEvent.click(screen.getByTitle('复制'));
    expect(copy).toHaveBeenCalled();
  });

  it('全屏 Modal：打开后交互不抛（container 回退）', async () => {
    wrap(
      <ReadonlyTableComponent element={baseEl as any} baseCls="md-table">
        <tr>
          <td>A</td>
        </tr>
      </ReadonlyTableComponent>,
    );
    fireEvent.click(screen.getByTitle('全屏'));
    expect(await screen.findByText('预览表格')).toBeInTheDocument();
    const modalBody =
      document.querySelector('.ant-modal-body') || document.body;
    fireEvent.mouseDown(modalBody);
    fireEvent.doubleClick(modalBody);
  });
});
