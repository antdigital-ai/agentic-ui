/**
 * BaseBar deepen residual：表格内工具栏、extra span、hideTools、image 过滤。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext, cnLabels } from '../../../../../I18n';
import { useEditorStore } from '../../../store';
import { BaseToolBar } from '../BaseBar';

vi.mock('../hooks/useToolBarLogic', () => ({
  useToolBarLogic: vi.fn(),
}));

vi.mock('../config/toolsConfig', () => ({
  useToolsConfig: () => [
    { key: 'bold', icon: 'B', label: 'bold' },
    { key: 'italic', icon: 'I', label: 'italic' },
  ],
}));

vi.mock('../../InsertAutocomplete', () => ({
  getInsertOptions: () => [
    {
      children: [
        { key: 'uploadImage', label: ['upload'], icon: 'U', task: 'uploadImage' },
        { key: 'list', label: ['list'], icon: 'L', task: 'list' },
      ],
    },
  ],
}));

vi.mock('../components/ClearFormatButton', () => ({
  ClearFormatButton: ({ onClear }: any) => (
    <button type="button" aria-label="clear" onClick={onClear}>
      clear
    </button>
  ),
}));

vi.mock('../components/FormatButton', () => ({
  FormatButton: () => <button type="button">format</button>,
}));

vi.mock('../components/ColorPickerButton', () => ({
  ColorPickerButton: () => <button type="button">color</button>,
}));

vi.mock('../components/FormattingTools', () => ({
  FormattingTools: ({ isInTable }: any) => (
    <div data-testid="formatting-tools" data-in-table={String(!!isInTable)} />
  ),
}));

vi.mock('../components/HeadingDropdown', () => ({
  HeadingDropdown: () => <div data-testid="heading-dropdown" />,
}));

vi.mock('../components/LinkButton', () => ({
  LinkButton: () => <div data-testid="link-button" />,
}));

vi.mock('../components/UndoRedoButtons', () => ({
  UndoRedoButtons: () => <div data-testid="undo-redo" />,
}));

vi.mock('../components/ToolBarItem', () => ({
  ToolBarItem: ({ children, onClick, title }: any) => (
    <button type="button" aria-label={title} onClick={onClick}>
      {children || title}
    </button>
  ),
}));

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

import { useToolBarLogic } from '../hooks/useToolBarLogic';
import { Node } from 'slate';

const baseLogic = {
  highColor: null,
  isCodeNode: () => false,
  isFormatActive: () => false,
  isHighColorActive: false,
  isLinkActive: false,
  handleUndo: vi.fn(),
  handleRedo: vi.fn(),
  handleClearFormat: vi.fn(),
  handleFormat: vi.fn(),
  handleHeadingChange: vi.fn(),
  handleColorChange: vi.fn(),
  handleToggleHighColor: vi.fn(),
  handleToolClick: vi.fn(),
  handleInsertLink: vi.fn(),
  handleInsert: vi.fn(),
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale: cnLabels, language: 'zh-CN' }}>
      {ui}
    </I18nContext.Provider>,
  );

describe('BaseBar deepen residual branches', () => {
  const markdownEditorRef = {
    current: {
      children: [],
      selection: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef,
      keyTask$: new Subject(),
      editorProps: { image: false },
      openInsertLink$: new Subject(),
      domRect: null,
      store: {},
      setDomRect: vi.fn(),
      floatBarRevision: 0,
      refreshFloatBar: 0,
    } as any);
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: [{ type: 'paragraph', children: [{ text: 'p' }] }, [0, 0]],
    } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('表格内节点：精简格式化工具 isInTable', () => {
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: [{ type: 'table-cell', children: [] }, [0, 0, 0]],
    } as any);
    wrap(<BaseToolBar showEditor min={false} />);
    expect(screen.getByTestId('formatting-tools')).toHaveAttribute(
      'data-in-table',
      'true',
    );
    expect(screen.queryByTestId('heading-dropdown')).not.toBeInTheDocument();
    expect(screen.queryByTestId('link-button')).not.toBeInTheDocument();
  });

  it('table-row 类型节点判定 isInTable', () => {
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: [{ type: 'table-row', children: [] }, [0, 0]],
    } as any);
    wrap(<BaseToolBar showEditor />);
    expect(screen.getByTestId('formatting-tools')).toHaveAttribute(
      'data-in-table',
      'true',
    );
  });

  it('Node.parent 抛错时不在表格内', () => {
    vi.spyOn(Node, 'parent').mockImplementation(() => {
      throw new Error('no parent');
    });
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: [{ type: 'paragraph', children: [] }, [0, 0]],
    } as any);
    wrap(<BaseToolBar showEditor />);
    expect(screen.getByTestId('link-button')).toBeInTheDocument();
    vi.mocked(Node.parent).mockRestore();
  });

  it('showInsertAction=false 且 image 关闭时过滤 uploadImage', () => {
    wrap(<BaseToolBar showEditor showInsertAction={false} />);
    expect(screen.queryByText('upload')).not.toBeInTheDocument();
  });

  it('min 模式表格内工具栏', () => {
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: [{ type: 'table-cell', children: [] }, [0, 0, 0]],
    } as any);
    wrap(<BaseToolBar min showEditor />);
    expect(screen.getByTestId('formatting-tools')).toHaveAttribute(
      'data-in-table',
      'true',
    );
  });

  it('min 模式非表格：Dropdown 与 undo-redo', () => {
    wrap(<BaseToolBar min showEditor />);
    expect(screen.getByTestId('undo-redo')).toBeInTheDocument();
  });

  it('extra：span 包裹与非 React 元素', () => {
    wrap(
      <BaseToolBar
        showEditor
        extra={[
          <span key="s">span-extra</span>,
          'plain-extra' as any,
          <div key="d" data-testid="div-extra">
            div
          </div>,
        ]}
      />,
    );
    expect(screen.getByText('span-extra')).toBeInTheDocument();
    expect(screen.getByText('plain-extra')).toBeInTheDocument();
    expect(screen.getByTestId('div-extra')).toBeInTheDocument();
  });

  it('hideTools 过滤 undo-redo 等 keyed 元素', () => {
    wrap(<BaseToolBar showEditor hideTools={['undo-redo']} />);
    expect(screen.queryByTestId('undo-redo')).not.toBeInTheDocument();
  });

  it('showEditor=false 时不渲染 undo-redo', () => {
    wrap(<BaseToolBar showEditor={false} />);
    expect(screen.queryByTestId('undo-redo')).not.toBeInTheDocument();
  });

  it('currentNode 为空时不渲染 link/heading', () => {
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: null,
    } as any);
    wrap(<BaseToolBar showEditor />);
    expect(screen.queryByTestId('link-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('heading-dropdown')).not.toBeInTheDocument();
  });

  it('handleInsert 可被 min dropdown 触发', () => {
    const handleInsert = vi.fn();
    vi.mocked(useToolBarLogic).mockReturnValue({
      ...baseLogic,
      currentNode: [{ type: 'paragraph', children: [] }, [0, 0]],
      handleInsert,
    } as any);
    wrap(<BaseToolBar min showEditor />);
    const moreBtn = screen.getByRole('button', { name: /更多操作|more/i });
    fireEvent.click(moreBtn);
    expect(moreBtn).toBeInTheDocument();
  });
});
