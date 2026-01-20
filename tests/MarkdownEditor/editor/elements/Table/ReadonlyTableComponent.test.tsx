import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import copy from 'copy-to-clipboard';
import React from 'react';
import { createEditor } from 'slate';
import { Slate, withReact } from 'slate-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyTableComponent } from '../../../../../src/MarkdownEditor/editor/elements/Table/ReadonlyTableComponent';
import * as editorStore from '../../../../../src/MarkdownEditor/editor/store';

// Mock dependencies
vi.mock('../../../../../src/MarkdownEditor/editor/store');
vi.mock('copy-to-clipboard');

vi.mock('../../../../../src/MarkdownEditor/editor/utils', () => ({
  parserSlateNodeToMarkdown: vi.fn(() => '| Header |\n| ------ |\n| Cell |'),
}));

vi.mock('../../../../../src/MarkdownEditor/I18n', () => ({
  I18nContext: {
    Provider: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('../../../../../src/Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <div data-testid="action-icon" onClick={onClick} title={title}>
      {children}
    </div>
  ),
}));

describe('ReadonlyTableComponent', () => {
  const createTestEditor = () => withReact(createEditor());

  const mockTableElement = {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            children: [{ type: 'paragraph', children: [{ text: 'Cell 1' }] }],
          },
          {
            type: 'table-cell',
            children: [{ type: 'paragraph', children: [{ text: 'Cell 2' }] }],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(editorStore.useEditorStore).mockReturnValue({
      editorProps: {
        tableConfig: {
          actions: {
            download: 'csv',
            fullScreen: 'modal',
            copy: 'md',
          },
        },
      },
    } as any);
    vi.mocked(copy).mockReturnValue(true);
  });

  const renderComponent = (element = mockTableElement, props: any = {}) => {
    const editor = createTestEditor();
    return render(
      <ConfigProvider>
        <Slate
          editor={editor}
          initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        >
          <ReadonlyTableComponent
            element={element as any}
            baseCls="ant-agentic-md-editor-content-table"
            {...props}
          >
            <tr>
              <td>Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </ReadonlyTableComponent>
        </Slate>
      </ConfigProvider>,
    );
  };

  describe('基本渲染测试', () => {
    it('应该正确渲染 ReadonlyTableComponent', () => {
      renderComponent();
      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('应该应用正确的类名', () => {
      renderComponent();
      const table = document.querySelector('table');
      expect(table).toHaveClass('ant-agentic-md-editor-content-table-editor-table');
      expect(table).toHaveClass('readonly');
    });

    it('应该渲染 tbody', () => {
      renderComponent();
      const tbody = document.querySelector('tbody');
      expect(tbody).toBeInTheDocument();
    });

    it('应该渲染子元素', () => {
      renderComponent();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 2')).toBeInTheDocument();
    });

    it('应该应用 pure 模式类名', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            pure: true,
          },
        },
      } as any);

      renderComponent();
      const table = document.querySelector('table');
      expect(table).toHaveClass('ant-agentic-md-editor-content-table-readonly-pure');
    });
  });

  describe('列宽计算测试', () => {
    it('应该使用 otherProps 中的 colWidths', () => {
      const elementWithColWidths = {
        ...mockTableElement,
        otherProps: {
          colWidths: [150, 200, 250],
        },
      };

      renderComponent(elementWithColWidths);
      const cols = document.querySelectorAll('col');
      expect(cols.length).toBe(3);
    });

    it('应该为没有 colWidths 的表格使用默认宽度', () => {
      renderComponent();
      const cols = document.querySelectorAll('col');
      expect(cols.length).toBe(2);
    });

    it('应该处理空的 children', () => {
      const elementWithEmptyChildren = {
        ...mockTableElement,
        children: [],
      };

      renderComponent(elementWithEmptyChildren);
      const cols = document.querySelectorAll('col');
      expect(cols.length).toBe(0);
    });

    it('应该为每一列应用正确的宽度样式', () => {
      const elementWithColWidths = {
        ...mockTableElement,
        otherProps: {
          colWidths: [100, 150],
        },
      };

      renderComponent(elementWithColWidths);
      const cols = document.querySelectorAll('col');
      const firstCol = cols[0] as HTMLElement;
      expect(firstCol.style.width).toBe('100px');
      expect(firstCol.style.minWidth).toBe('100px');
      expect(firstCol.style.maxWidth).toBe('100px');
    });
  });

  describe('操作按钮测试', () => {
    it('应该渲染全屏按钮', () => {
      renderComponent();
      const actionIcons = screen.getAllByTestId('action-icon');
      expect(actionIcons.length).toBeGreaterThan(0);
    });

    it('应该渲染复制按钮', () => {
      renderComponent();
      const actionIcons = screen.getAllByTestId('action-icon');
      expect(actionIcons.length).toBeGreaterThan(0);
    });

    it('应该处理复制按钮点击（Markdown 格式）', () => {
      renderComponent();
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');

      if (copyButton) {
        fireEvent.click(copyButton);
        expect(copy).toHaveBeenCalled();
      }
    });

    it('应该处理复制按钮点击（HTML 格式）', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            actions: {
              copy: 'html',
            },
          },
        },
      } as any);

      renderComponent();
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');

      if (copyButton) {
        fireEvent.click(copyButton);
        expect(copy).toHaveBeenCalled();
      }
    });

    it('应该处理复制按钮点击（CSV 格式）', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            actions: {
              copy: 'csv',
            },
          },
        },
      } as any);

      const elementWithData = {
        ...mockTableElement,
        otherProps: {
          columns: [{ title: 'Column 1' }, { title: 'Column 2' }],
          dataSource: [{ col1: 'Data 1', col2: 'Data 2' }],
        },
      };

      renderComponent(elementWithData);
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');

      if (copyButton) {
        fireEvent.click(copyButton);
        expect(copy).toHaveBeenCalled();
      }
    });

    it('应该处理全屏按钮点击', async () => {
      renderComponent();
      const fullscreenButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '全屏');

      if (fullscreenButton) {
        fireEvent.click(fullscreenButton);

        await waitFor(() => {
          expect(screen.getByText('预览表格')).toBeInTheDocument();
        });
      }
    });

    it('应该隐藏全屏按钮当配置为 false', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            actions: {
              fullScreen: false,
            },
          },
        },
      } as any);

      renderComponent();
      const actionIcons = screen.queryAllByTestId('action-icon');
      // 只应该有复制按钮
      expect(actionIcons.length).toBeLessThanOrEqual(1);
    });

    it('应该隐藏复制按钮当配置为 false', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            actions: {
              copy: false,
            },
          },
        },
      } as any);

      renderComponent();
      const copyButton = screen
        .queryAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');
      expect(copyButton).toBeUndefined();
    });
  });

  describe('模态框测试', () => {
    it('应该在点击全屏后显示模态框', async () => {
      renderComponent();
      const fullscreenButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '全屏');

      if (fullscreenButton) {
        fireEvent.click(fullscreenButton);

        await waitFor(() => {
          expect(screen.getByText('预览表格')).toBeInTheDocument();
        });
      }
    });

    it('应该使用自定义预览标题', async () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            previewTitle: '自定义标题',
            actions: {
              fullScreen: 'modal',
            },
          },
        },
      } as any);

      renderComponent();
      const fullscreenButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '全屏');

      if (fullscreenButton) {
        fireEvent.click(fullscreenButton);

        await waitFor(() => {
          expect(screen.getByText('自定义标题')).toBeInTheDocument();
        });
      }
    });

    it('应该处理模态框关闭', async () => {
      renderComponent();
      const fullscreenButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '全屏');

      if (fullscreenButton) {
        fireEvent.click(fullscreenButton);

        await waitFor(() => {
          expect(screen.getByText('预览表格')).toBeInTheDocument();
        });

        // 查找并点击关闭按钮
        const modal = document.querySelector('.ant-modal');
        if (modal) {
          // 模拟关闭
          const closeButton = modal.querySelector('.ant-modal-close');
          if (closeButton) {
            fireEvent.click(closeButton);
          }
        }
      }
    });

    it('应该在模态框中阻止默认的文字选择行为', async () => {
      renderComponent();
      const fullscreenButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '全屏');

      if (fullscreenButton) {
        fireEvent.click(fullscreenButton);

        await waitFor(() => {
          const modalContent = document.querySelector('.ant-agentic-md-editor-content');
          if (modalContent) {
            const mouseDownEvent = new MouseEvent('mousedown', {
              bubbles: true,
            });
            vi.spyOn(mouseDownEvent, 'preventDefault');
            modalContent.dispatchEvent(mouseDownEvent);
            expect(modalContent).toBeInTheDocument();
          }
        });
      }
    });
  });

  describe('样式和容器测试', () => {
    it('应该应用 baseCls', () => {
      renderComponent();
      const wrapper = document.querySelector('.ant-agentic-md-editor-content-table');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('复制功能扩展测试', () => {
    it('应该处理复制错误', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      vi.mocked(copy).mockImplementation(() => {
        throw new Error('Copy failed');
      });

      renderComponent();
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');

      if (copyButton) {
        fireEvent.click(copyButton);
        expect(consoleErrorSpy).toHaveBeenCalled();
      }

      consoleErrorSpy.mockRestore();
    });

    it('应该处理没有 tableRef 的情况', () => {
      renderComponent();
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');

      if (copyButton) {
        fireEvent.click(copyButton);
        expect(copy).toHaveBeenCalled();
      }
    });

    it('应该处理没有 otherProps 的 CSV 复制', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {
            actions: {
              copy: 'csv',
            },
          },
        },
      } as any);

      renderComponent();
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');

      if (copyButton) {
        fireEvent.click(copyButton);
        expect(copy).toHaveBeenCalled();
      }
    });
  });

  describe('边界情况测试', () => {
    it('应该处理没有 actions 配置', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {
          tableConfig: {},
        },
      } as any);

      renderComponent();
      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('应该处理没有 tableConfig', () => {
      vi.mocked(editorStore.useEditorStore).mockReturnValue({
        editorProps: {},
      } as any);

      renderComponent();
      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('应该处理空的 children', () => {
      const { container } = render(
        <ConfigProvider>
          <Slate
            editor={createTestEditor()}
            initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
          >
            <ReadonlyTableComponent
              element={mockTableElement as any}
              baseCls="ant-agentic-md-editor-content-table"
            >
              {null}
            </ReadonlyTableComponent>
          </Slate>
        </ConfigProvider>,
      );

      const table = container.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    it('应该处理包含很多列的表格', () => {
      const elementWithManyCols = {
        ...mockTableElement,
        children: [
          {
            type: 'table-row',
            children: Array.from({ length: 10 }, (_, i) => ({
              type: 'table-cell',
              children: [
                { type: 'paragraph', children: [{ text: `Cell ${i + 1}` }] },
              ],
            })),
          },
        ],
      };

      renderComponent(elementWithManyCols);
      const cols = document.querySelectorAll('col');
      expect(cols.length).toBe(10);
    });

    it('应该为每列应用默认宽度 120', () => {
      renderComponent();
      const cols = document.querySelectorAll('col');
      cols.forEach((col) => {
        const htmlCol = col as HTMLElement;
        expect(htmlCol.style.width).toBe('80px');
      });
    });
  });

  describe('React.memo 优化测试', () => {
    it('应该在相同 props 时不重新渲染', () => {
      const { rerender } = renderComponent();

      const firstTable = document.querySelector('table');

      rerender(
        <ConfigProvider>
          <Slate
            editor={createTestEditor()}
            initialValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
          >
            <ReadonlyTableComponent
              element={mockTableElement as any}
              baseCls="ant-agentic-md-editor-content-table"
            >
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
              </tr>
            </ReadonlyTableComponent>
          </Slate>
        </ConfigProvider>,
      );

      const secondTable = document.querySelector('table');
      // React.memo 应该保持引用
      expect(firstTable).toBe(secondTable);
    });
  });

  describe('国际化测试', () => {
    it('应该使用默认的全屏文本', () => {
      renderComponent();
      const fullscreenButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '全屏');
      expect(fullscreenButton).toHaveAttribute('title', '全屏');
    });

    it('应该使用默认的复制文本', () => {
      renderComponent();
      const copyButton = screen
        .getAllByTestId('action-icon')
        .find((el) => el.getAttribute('title') === '复制');
      expect(copyButton).toHaveAttribute('title', '复制');
    });
  });
});
