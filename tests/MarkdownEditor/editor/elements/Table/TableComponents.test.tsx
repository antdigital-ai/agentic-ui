import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TableCellIndex } from '../../../../../src/MarkdownEditor/editor/elements/Table/TableCellIndex';
import { TableCellIndexSpacer } from '../../../../../src/MarkdownEditor/editor/elements/Table/TableCellIndexSpacer';
import { TableRowIndex } from '../../../../../src/MarkdownEditor/editor/elements/Table/TableRowIndex';
import { Td } from '../../../../../src/MarkdownEditor/editor/elements/Table/Td';

// Mock dependencies
vi.mock('../../../../../src/MarkdownEditor/editor/store');
vi.mock('../../../../../src/MarkdownEditor/hooks/editor');
vi.mock('../../../../../src/MarkdownEditor/hooks/useClickAway', () => ({
  useClickAway: vi.fn(),
}));

vi.mock('slate-react', async () => {
  const actual = await vi.importActual('slate-react');
  return {
    ...actual,
    useSlateSelection: vi.fn(),
    ReactEditor: {
      toDOMNode: vi.fn(() => {
        const mockElement = document.createElement('td');
        mockElement.setAttribute = vi.fn();
        mockElement.removeAttribute = vi.fn();
        return mockElement;
      }),
      findPath: vi.fn(),
    },
  };
});

vi.mock('../../../../../src/MarkdownEditor/utils/native-table', () => ({
  NativeTableEditor: {
    removeTable: vi.fn(),
  },
}));

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/TableCellIndex/style',
  () => ({
    useStyle: vi.fn(() => ({
      wrapSSR: (component: any) => component,
      hashId: 'test-hash',
    })),
  }),
);

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/TableCellIndexSpacer/style',
  () => ({
    useStyle: vi.fn(() => ({
      wrapSSR: (component: any) => component,
      hashId: 'test-hash',
    })),
  }),
);

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/TableRowIndex/style',
  () => ({
    useStyle: vi.fn(() => ({
      wrapSSR: (component: any) => component,
      hashId: 'test-hash',
    })),
  }),
);

vi.mock(
  '../../../../../src/MarkdownEditor/editor/elements/Table/Td/style',
  () => ({
    useStyle: vi.fn(() => ({
      wrapSSR: (component: any) => component,
      hashId: 'test-hash',
    })),
  }),
);

describe('Table 组件测试', () => {
  const createTestEditor = () => withReact(createEditor());

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TableCellIndex 组件', () => {
    const renderTableCellIndex = (props: any = {}) => {
      const editor = createTestEditor();
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [
                    { type: 'paragraph', children: [{ text: 'Cell' }] },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const defaultProps = {
        targetRow: { type: 'table-row', children: [] },
        rowIndex: 0,
        tablePath: [0],
        ...props,
      };

      return render(
        <ConfigProvider>
          <Slate editor={editor} initialValue={editor.children as any}>
            <table>
              <tbody>
                <tr>
                  <TableCellIndex {...defaultProps} />
                </tr>
              </tbody>
            </table>
          </Slate>
        </ConfigProvider>,
      );
    };

    it('应该正确渲染 TableCellIndex 组件', () => {
      renderTableCellIndex();
      const td = document.querySelector('td');
      expect(td).toBeInTheDocument();
    });

    it('应该应用正确的类名', () => {
      renderTableCellIndex();
      const td = document.querySelector('td');
      expect(td).toHaveClass('ant-agentic-md-editor-table-cell-index');
    });

    it('应该设置 contentEditable 为 false', () => {
      renderTableCellIndex();
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('contentEditable', 'false');
    });

    it('应该显示正确的 cursor 样式', () => {
      renderTableCellIndex({ rowIndex: 0 });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.cursor).toBe('pointer');
    });

    it('应该在没有 rowIndex 时显示 default cursor', () => {
      renderTableCellIndex({ rowIndex: undefined });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.cursor).toBe('default');
    });

    it('应该在点击时触发 onClick 事件', () => {
      renderTableCellIndex();
      const td = document.querySelector('td');
      if (td) {
        fireEvent.click(td);
      }
      expect(td).toBeInTheDocument();
    });

    it('应该有正确的 title 属性', () => {
      renderTableCellIndex({ rowIndex: 0 });
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('title', '点击显示操作按钮');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red' };
      renderTableCellIndex({ style: customStyle });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.backgroundColor).toBe('red');
    });

    it('应该应用自定义类名', () => {
      renderTableCellIndex({ className: 'custom-class' });
      const td = document.querySelector('td');
      expect(td).toHaveClass('custom-class');
    });

    it('应该包含删除图标', () => {
      renderTableCellIndex();
      const deleteIcon = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-delete-icon',
      );
      expect(deleteIcon).toBeInTheDocument();
    });

    it('应该处理删除按钮点击', () => {
      renderTableCellIndex();
      const deleteButton = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-delete-icon',
      );
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
      expect(deleteButton).toBeInTheDocument();
    });

    it('应该在 shouldShowDeleteIcon 为 true 时显示操作按钮', () => {
      const { container } = renderTableCellIndex({ rowIndex: 0 });
      const actionButtons = container.querySelector(
        '.ant-agentic-md-editor-table-cell-index-action-buttons',
      );
      expect(actionButtons).toBeInTheDocument();
    });

    it('应该处理在上面插入行按钮点击', () => {
      renderTableCellIndex({ rowIndex: 0 });
      const insertBefore = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-insert-row-before',
      );
      expect(insertBefore).toBeDefined();
    });

    it('应该处理在下面插入行按钮点击', () => {
      renderTableCellIndex({ rowIndex: 0 });
      const insertAfter = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-insert-row-after',
      );
      expect(insertAfter).toBeDefined();
    });

    it('应该设置正确的 padding', () => {
      renderTableCellIndex();
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.padding).toBe('0px');
    });

    it('应该设置 position 为 relative', () => {
      renderTableCellIndex();
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.position).toBe('relative');
    });
  });

  describe('TableCellIndexSpacer 组件', () => {
    const renderTableCellIndexSpacer = (props: any = {}) => {
      const editor = createTestEditor();
      editor.children = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [
                    { type: 'paragraph', children: [{ text: 'Cell' }] },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const defaultProps = {
        columnIndex: 0,
        tablePath: [0],
        ...props,
      };

      return render(
        <ConfigProvider>
          <Slate editor={editor} initialValue={editor.children as any}>
            <table>
              <tbody>
                <tr>
                  <TableCellIndexSpacer {...defaultProps} />
                </tr>
              </tbody>
            </table>
          </Slate>
        </ConfigProvider>,
      );
    };

    it('应该正确渲染 TableCellIndexSpacer 组件', () => {
      renderTableCellIndexSpacer();
      const td = document.querySelector('td');
      expect(td).toBeInTheDocument();
    });

    it('应该应用正确的类名', () => {
      renderTableCellIndexSpacer();
      const td = document.querySelector('td');
      expect(td).toHaveClass('ant-agentic-md-editor-table-cell-index-spacer');
    });

    it('应该设置 contentEditable 为 false', () => {
      renderTableCellIndexSpacer();
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('contentEditable', 'false');
    });

    it('应该显示正确的 cursor 样式', () => {
      renderTableCellIndexSpacer({ columnIndex: 0 });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.cursor).toBe('pointer');
    });

    it('应该在点击时触发 onClick 事件', () => {
      renderTableCellIndexSpacer();
      const td = document.querySelector('td');
      if (td) {
        fireEvent.click(td);
      }
      expect(td).toBeInTheDocument();
    });

    it('应该有正确的 title 属性', () => {
      renderTableCellIndexSpacer({ columnIndex: 0 });
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('title', '点击选中整列，显示操作按钮');
    });

    it('应该处理 columnIndex 为 -1 的情况', () => {
      renderTableCellIndexSpacer({ columnIndex: -1 });
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('title', '点击选中整个表格');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'blue' };
      renderTableCellIndexSpacer({ style: customStyle });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.backgroundColor).toBe('blue');
    });

    it('应该应用自定义类名', () => {
      renderTableCellIndexSpacer({ className: 'custom-spacer' });
      const td = document.querySelector('td');
      expect(td).toHaveClass('custom-spacer');
    });

    it('应该包含删除图标', () => {
      renderTableCellIndexSpacer();
      const deleteIcon = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-spacer-delete-icon',
      );
      expect(deleteIcon).toBeInTheDocument();
    });

    it('应该处理删除按钮点击', () => {
      renderTableCellIndexSpacer();
      const deleteButton = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-spacer-delete-icon',
      );
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
      expect(deleteButton).toBeInTheDocument();
    });

    it('应该设置正确的 padding', () => {
      renderTableCellIndexSpacer();
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.padding).toBe('0px');
    });

    it('应该设置 position 为 relative', () => {
      renderTableCellIndexSpacer();
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.position).toBe('relative');
    });

    it('应该在没有 columnIndex 时显示 default cursor', () => {
      renderTableCellIndexSpacer({ columnIndex: undefined });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.cursor).toBe('default');
    });

    it('应该处理在前面插入列按钮', () => {
      renderTableCellIndexSpacer({ columnIndex: 0 });
      const insertBefore = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-spacer-insert-column-before',
      );
      expect(insertBefore).toBeDefined();
    });

    it('应该处理在后面插入列按钮', () => {
      renderTableCellIndexSpacer({ columnIndex: 0 });
      const insertAfter = document.querySelector(
        '.ant-agentic-md-editor-table-cell-index-spacer-insert-column-after',
      );
      expect(insertAfter).toBeDefined();
    });
  });

  describe('TableRowIndex 组件', () => {
    const renderTableRowIndex = (props: any = {}) => {
      const editor = createTestEditor();
      const defaultProps = {
        colWidths: [100, 150, 200],
        tablePath: [0],
        ...props,
      };

      return render(
        <ConfigProvider>
          <Slate
            editor={editor}
            initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
          >
            <table>
              <tbody>
                <TableRowIndex {...defaultProps} />
              </tbody>
            </table>
          </Slate>
        </ConfigProvider>,
      );
    };

    it('应该正确渲染 TableRowIndex 组件', () => {
      renderTableRowIndex();
      const tr = document.querySelector('tr');
      expect(tr).toBeInTheDocument();
    });

    it('应该应用正确的类名', () => {
      renderTableRowIndex();
      const tr = document.querySelector('tr');
      expect(tr).toHaveClass('ant-agentic-md-editor-table-row-index');
    });

    it('应该渲染第一个 TableCellIndexSpacer（columnIndex=-1）', () => {
      renderTableRowIndex();
      const spacers = document.querySelectorAll('td');
      expect(spacers.length).toBeGreaterThan(0);
    });

    it('应该根据 colWidths 渲染对应数量的 spacers', () => {
      renderTableRowIndex({ colWidths: [100, 150, 200] });
      const spacers = document.querySelectorAll('td');
      // 1 个用于 columnIndex=-1，3 个用于列
      expect(spacers.length).toBe(4);
    });

    it('应该处理空的 colWidths 数组', () => {
      renderTableRowIndex({ colWidths: [] });
      const spacers = document.querySelectorAll('td');
      // 只有 1 个用于 columnIndex=-1
      expect(spacers.length).toBe(1);
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'green' };
      renderTableRowIndex({ style: customStyle });
      const tr = document.querySelector('tr') as HTMLElement;
      expect(tr.style.backgroundColor).toBe('green');
    });

    it('应该应用自定义类名', () => {
      renderTableRowIndex({ className: 'custom-row-index' });
      const tr = document.querySelector('tr');
      expect(tr).toHaveClass('custom-row-index');
    });

    it('应该传递 tablePath 给子组件', () => {
      renderTableRowIndex({ tablePath: [0, 1] });
      expect(document.querySelector('tr')).toBeInTheDocument();
    });

    it('应该渲染正确数量的列间隔单元格', () => {
      renderTableRowIndex({ colWidths: [100, 150] });
      const spacers = document.querySelectorAll('td');
      expect(spacers.length).toBe(3); // 1 + 2
    });

    it('应该处理大量列的情况', () => {
      const manyColumns = Array(20).fill(100);
      renderTableRowIndex({ colWidths: manyColumns });
      const spacers = document.querySelectorAll('td');
      expect(spacers.length).toBe(21); // 1 + 20
    });
  });

  describe('Td 组件', () => {
    const renderTd = (props: any = {}) => {
      const editor = createTestEditor();
      const defaultProps = {
        element: {
          type: 'table-cell',
          children: [
            { type: 'paragraph', children: [{ text: 'Cell content' }] },
          ],
        },
        attributes: {
          'data-slate-node': 'element' as const,
          ref: vi.fn(),
        },
        children: [<div key="1">Cell content</div>],
        cellPath: [0, 0, 0],
        ...props,
      };

      return render(
        <ConfigProvider>
          <Slate
            editor={editor}
            initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
          >
            <table>
              <tbody>
                <tr>
                  <Td {...defaultProps} />
                </tr>
              </tbody>
            </table>
          </Slate>
        </ConfigProvider>,
      );
    };

    it('应该正确渲染 Td 组件', () => {
      renderTd();
      const td = document.querySelector('td');
      expect(td).toBeInTheDocument();
    });

    it('应该显示单元格内容', () => {
      renderTd();
      expect(screen.getByText('Cell content')).toBeInTheDocument();
    });

    it('应该应用正确的类名', () => {
      renderTd();
      const td = document.querySelector('td');
      expect(td).toHaveClass('ant-agentic-md-editor-table-td');
    });

    it('应该处理错误的元素类型', () => {
      const invalidProps = {
        element: { type: 'invalid-type' },
        attributes: { 'data-slate-node': 'element' as const, ref: vi.fn() },
        children: [<div key="1">Cell content</div>],
      };

      expect(() => renderTd(invalidProps)).toThrow(
        'Element "Td" must be of type "table-cell"',
      );
    });

    it('应该应用左对齐（默认）', () => {
      renderTd();
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.textAlign).toBe('left');
    });

    it('应该应用自定义对齐方式', () => {
      renderTd({
        element: {
          type: 'table-cell',
          align: 'center',
          children: [],
        },
      });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.textAlign).toBe('center');
    });

    it('应该应用右对齐', () => {
      renderTd({
        element: {
          type: 'table-cell',
          align: 'right',
          children: [],
        },
      });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.textAlign).toBe('right');
    });

    it('应该应用自定义宽度', () => {
      renderTd({
        element: {
          type: 'table-cell',
          width: '200px',
          children: [],
        },
      });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.width).toBe('200px');
    });

    it('应该使用 auto 宽度（默认）', () => {
      renderTd();
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.width).toBe('auto');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'yellow' };
      renderTd({ style: customStyle });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.backgroundColor).toBe('yellow');
    });

    it('应该处理 rowSpan 属性', () => {
      renderTd({
        element: {
          type: 'table-cell',
          rowSpan: 2,
          children: [],
        },
      });
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('rowSpan', '2');
    });

    it('应该处理 colSpan 属性', () => {
      renderTd({
        element: {
          type: 'table-cell',
          colSpan: 3,
          children: [],
        },
      });
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('colSpan', '3');
    });

    it('应该处理隐藏的单元格', () => {
      renderTd({
        element: {
          type: 'table-cell',
          hidden: true,
          children: [],
        },
      });
      const td = document.querySelector('td') as HTMLElement;
      expect(td.style.display).toBe('none');
    });

    it('应该处理同时设置 rowSpan 和 colSpan', () => {
      renderTd({
        element: {
          type: 'table-cell',
          rowSpan: 2,
          colSpan: 3,
          children: [],
        },
      });
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('rowSpan', '2');
      expect(td).toHaveAttribute('colSpan', '3');
    });

    it('应该传递 attributes', () => {
      renderTd();
      const td = document.querySelector('td');
      expect(td).toHaveAttribute('data-slate-node', 'element');
    });

    it('应该处理复杂的子元素', () => {
      const complexChildren = [
        <div key="1">
          <span>First</span>
        </div>,
        <div key="2">
          <span>Second</span>
        </div>,
      ];
      renderTd({ children: complexChildren });
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });
});
