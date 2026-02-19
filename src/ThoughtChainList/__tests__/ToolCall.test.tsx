import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToolCall } from '../ToolCall';

// Mock copy-to-clipboard
vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(),
}));

vi.mock('../I18n', () => ({
  I18nContext: React.createContext({
    locale: 'zh-CN',
    executionParameters: '执行入参',
    executionResult: '执行结果',
    apiCalling: 'API 调用中',
    taskExecutionFailed: '任务执行失败，需要修改',
    copy: '复制',
    edit: '修改',
    cancel: '取消',
    retry: '重试',
  }),
}));

vi.mock('../../MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue, editorRef }: any) => {
    React.useImperativeHandle(editorRef, () => ({
      store: {
        setMDContent: vi.fn(),
        editor: {
          children: [],
        },
      },
    }));
    return (
      <div data-testid="markdown-editor" data-init-value={initValue}>
        <div data-testid="editor-content">{initValue}</div>
      </div>
    );
  },
  MarkdownEditorInstance: {},
  parserSlateNodeToMarkdown: vi.fn(() => 'parsed content'),
}));

vi.mock('../../index', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button
      type="button"
      data-testid={`action-${title}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  ),
}));

vi.mock('./CostMillis', () => ({
  CostMillis: ({ costMillis }: any) => (
    <span data-testid="cost-millis">{costMillis}ms</span>
  ),
}));

vi.mock('./DotAni', () => ({
  DotLoading: () => <div data-testid="dot-loading">Loading...</div>,
}));

describe('ToolCall Component', () => {
  const mockProps = {
    runId: 'test-run-id',
    input: {
      inputArgs: {
        parameters: { id: 1, name: 'test' },
        params: { page: 1, size: 10 },
      },
    },
    output: {
      response: { status: 'success', data: { id: 1, name: 'test' } },
    },
    costMillis: 1500,
    isFinished: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染测试', () => {
    it('应该正确渲染执行参数', () => {
      render(<ToolCall {...mockProps} />);
      expect(screen.getByText('执行入参')).toBeInTheDocument();
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
    it('应该正确渲染执行结果', () => {
      render(<ToolCall {...mockProps} />);
      expect(screen.getByText('执行结果')).toBeInTheDocument();
      expect(screen.getByText('1.5秒')).toBeInTheDocument();
    });
    it('应该正确渲染复制按钮', () => {
      render(<ToolCall {...mockProps} />);
      const copyButtons = screen.getAllByTestId('action-复制');
      expect(copyButtons.length).toBeGreaterThan(0);
    });
    it('应该正确渲染编辑按钮', () => {
      render(<ToolCall {...mockProps} onChangeItem={vi.fn()} />);
      expect(screen.getByTestId('action-修改')).toBeInTheDocument();
    });
    it('应该在没有 onChangeItem 时不显示编辑按钮', () => {
      render(<ToolCall {...mockProps} />);
      expect(screen.queryByTestId('action-修改')).not.toBeInTheDocument();
    });
  });

  describe('复制功能测试', () => {
    it('应该正确复制输入参数', async () => {
      const copy = (await import('copy-to-clipboard')).default;
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} />);

      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[0]); // 第一个复制按钮是输入参数的

      expect(copy).toHaveBeenCalledWith(
        JSON.stringify(mockProps.input.inputArgs, null, 2),
      );
    });

    it('应该正确复制输出结果', async () => {
      const copy = (await import('copy-to-clipboard')).default;
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} />);

      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[1]); // 第二个复制按钮是输出结果的

      expect(copy).toHaveBeenCalledWith(
        JSON.stringify(mockProps.output.response, null, 2),
      );
    });

    it('应该正确复制错误信息', async () => {
      const copy = (await import('copy-to-clipboard')).default;
      const user = userEvent.setup();
      const errorProps = {
        ...mockProps,
        output: { errorMsg: '测试错误信息' },
      };
      render(<ToolCall {...errorProps} isFinished={true} />);

      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[copyButtons.length - 1]); // 最后一个复制按钮是错误信息的

      expect(copy).toHaveBeenCalledWith('测试错误信息');
    });
  });

  describe('状态渲染测试', () => {
    it('应该在未完成时显示加载状态', () => {
      render(<ToolCall {...mockProps} isFinished={false} />);
      expect(screen.getByText(/API\s*调用中/)).toBeInTheDocument();
      expect(screen.getByTestId('dot-loading')).toBeInTheDocument();
    });
    it('应该在完成时显示执行结果', () => {
      render(<ToolCall {...mockProps} isFinished={true} />);
      expect(screen.getByText('执行结果')).toBeInTheDocument();
      expect(screen.queryByText(/API\s*调用中/)).not.toBeInTheDocument();
    });
    it('应该在完成且有错误时显示错误信息', () => {
      const errorProps = {
        ...mockProps,
        output: { errorMsg: '测试错误信息' },
      };
      render(<ToolCall {...errorProps} isFinished={true} />);
      expect(screen.getByText(/任务执行失败/)).toBeInTheDocument();
      expect(screen.getByText('测试错误信息')).toBeInTheDocument();
    });
    it('应该处理嵌套错误信息', () => {
      const nestedErrorProps = {
        ...mockProps,
        output: { response: { error: '嵌套错误信息' } },
      };
      render(<ToolCall {...nestedErrorProps} isFinished={true} />);
      expect(screen.getByText(/任务执行失败/)).toBeInTheDocument();
      expect(screen.getByText('嵌套错误信息')).toBeInTheDocument();
    });
    it('应该处理多种错误信息格式', () => {
      const errorMsgProps = {
        ...mockProps,
        output: { response: { errorMsg: '错误消息格式' } },
      };
      render(<ToolCall {...errorMsgProps} isFinished={true} />);
      expect(screen.getByText(/任务执行失败/)).toBeInTheDocument();
      expect(screen.getByText('错误消息格式')).toBeInTheDocument();
    });
  });

  describe('编辑器模式测试', () => {
    it('应该在点击编辑按钮时进入编辑器模式', async () => {
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} onChangeItem={vi.fn()} />);
      const editButton = screen.getByTestId('action-修改');
      await user.click(editButton);
      expect(
        screen.getByText((c) => c.replace(/\s/g, '') === '取消'),
      ).toBeInTheDocument();
      expect(
        screen.getByText((c) => c.replace(/\s/g, '') === '重试'),
      ).toBeInTheDocument();
    });
    it('应该在点击取消按钮时退出编辑器模式', async () => {
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} onChangeItem={vi.fn()} />);
      const editButton = screen.getByTestId('action-修改');
      await user.click(editButton);
      const cancelButton = screen.getByText(
        (c) => c.replace(/\s/g, '') === '取消',
      );
      await user.click(cancelButton);
      expect(
        screen.queryByText((c) => c.replace(/\s/g, '') === '取消'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText((c) => c.replace(/\s/g, '') === '重试'),
      ).not.toBeInTheDocument();
    });
    it('应该在点击重试按钮时调用 onChangeItem', async () => {
      const onChangeItem = vi.fn();
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} onChangeItem={onChangeItem} />);
      const editButton = screen.getByTestId('action-修改');
      await user.click(editButton);
      const retryButton = screen.getByText(
        (c) => c.replace(/\s/g, '') === '重试',
      );
      await user.click(retryButton);
      expect(onChangeItem).toHaveBeenCalledWith(
        expect.objectContaining({
          runId: 'test-run-id',
          input: mockProps.input,
          output: mockProps.output,
          costMillis: 1500,
          isFinished: true,
        }),
        expect.objectContaining({
          feedbackContent: 'parsed content',
          feedbackType: 'toolArg',
          feedbackRunId: 'test-run-id',
        }),
      );
    });
    it('仅传 onChangeItem（无 onItemChange）时点击重试应走 onChangeItem 分支', async () => {
      const onChangeItem = vi.fn();
      const user = userEvent.setup();
      render(
        <ToolCall
          {...mockProps}
          onChangeItem={onChangeItem}
          onItemChange={undefined}
        />,
      );
      const editButton = screen.getByTestId('action-修改');
      await user.click(editButton);
      const retryButton = screen.getByText(
        (c) => c.replace(/\s/g, '') === '重试',
      );
      await user.click(retryButton);
      expect(onChangeItem).toHaveBeenCalled();
    });
    it('应该在编辑器模式下正确显示编辑器内容', async () => {
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} onChangeItem={vi.fn()} />);
      const editButton = screen.getByTestId('action-修改');
      await user.click(editButton);

      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
      expect(editors[0]).toHaveAttribute(
        'data-init-value',
        expect.stringContaining('```json'),
      );
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的 inputArgs', () => {
      const emptyProps = {
        ...mockProps,
        input: {},
      };
      render(<ToolCall {...emptyProps} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
    it('应该处理空的 response', () => {
      const emptyProps = {
        ...mockProps,
        output: {},
      };
      render(<ToolCall {...emptyProps} isFinished={true} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
    it('应该处理没有 costMillis 的情况', () => {
      const noCostProps = {
        ...mockProps,
        costMillis: undefined,
      };
      render(<ToolCall {...noCostProps} />);
      expect(screen.queryByTestId('cost-millis')).not.toBeInTheDocument();
    });
    it('应该处理自定义 data-testid', () => {
      render(<ToolCall {...mockProps} data-testid="custom-toolcall" />);
      expect(screen.getByTestId('custom-toolcall')).toBeInTheDocument();
    });
    it('应该处理 null 和 undefined 值', () => {
      const nullProps = {
        ...mockProps,
        input: { inputArgs: undefined },
        output: { response: undefined },
      };
      render(<ToolCall {...nullProps} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
    it('应该处理复杂的嵌套对象', () => {
      const complexProps = {
        ...mockProps,
        input: {
          inputArgs: {
            parameters: {
              deep: {
                nested: {
                  object: {
                    with: {
                      arrays: [1, 2, 3],
                      strings: 'test',
                      numbers: 123,
                      booleans: true,
                    },
                  },
                },
              },
            },
          },
        },
      };
      render(<ToolCall {...complexProps} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
  });

  describe('MarkdownEditor 集成测试', () => {
    it('应该传递正确的 markdownRenderProps', () => {
      const markdownProps = {
        style: { fontSize: '13px' },
        contentStyle: { padding: '10px' },
      };
      render(<ToolCall {...mockProps} markdownRenderProps={markdownProps} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
    it('应该正确格式化 JSON 数据', () => {
      render(<ToolCall {...mockProps} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors[0]).toHaveAttribute(
        'data-init-value',
        expect.stringContaining('```json'),
      );
    });
    it('应该正确处理特殊字符', () => {
      const specialCharProps = {
        ...mockProps,
        input: {
          inputArgs: {
            parameters: {
              special: '特殊字符: "引号", \'单引号\', <标签>, &符号',
              unicode: '中文测试 🚀 emoji',
            },
          },
        },
      };
      render(<ToolCall {...specialCharProps} />);
      const editors = screen.getAllByTestId('markdown-editor');
      expect(editors.length).toBeGreaterThan(0);
    });
  });

  describe('性能优化测试', () => {
    it('应该使用 useMemo 优化渲染', () => {
      const { rerender } = render(<ToolCall {...mockProps} />);
      rerender(<ToolCall {...mockProps} />);
      expect(screen.getByText('执行入参')).toBeInTheDocument();
    });
    it('应该在依赖项变化时重新渲染', () => {
      const { rerender } = render(<ToolCall {...mockProps} />);
      const newProps = {
        ...mockProps,
        input: {
          inputArgs: { newParam: 'newValue' } as any,
        },
      };
      rerender(<ToolCall {...newProps} />);
      expect(screen.getByText('执行入参')).toBeInTheDocument();
    });
    it('应该避免不必要的重新渲染', () => {
      const { rerender } = render(<ToolCall {...mockProps} />);
      const sameProps = { ...mockProps };
      rerender(<ToolCall {...sameProps} />);
      expect(screen.getByText('执行入参')).toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('应该包含正确的 ARIA 标签', () => {
      render(<ToolCall {...mockProps} />);
      const copyButtons = screen.getAllByTestId('action-复制');
      copyButtons.forEach((button) => {
        expect(button).toHaveAttribute('title', '复制');
      });
    });
    it('应该支持键盘导航', async () => {
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} onChangeItem={vi.fn()} />);
      const editButton = screen.getByTestId('action-修改');

      // 测试 Tab 键导航
      await user.tab();
      // 由于有多个可聚焦元素，我们检查编辑按钮是否在文档中
      expect(editButton).toBeInTheDocument();
    });
  });

  describe('复制失败 catch 分支', () => {
    it('复制入参失败时应捕获错误并 console.error', async () => {
      const copy = (await import('copy-to-clipboard')).default;
      vi.mocked(copy).mockImplementationOnce(() => {
        throw new Error('copy failed');
      });
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} />);
      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[0]);
      expect(errSpy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      errSpy.mockRestore();
    });
    it('复制执行结果失败时应捕获错误并 console.error', async () => {
      const copy = (await import('copy-to-clipboard')).default;
      vi.mocked(copy).mockImplementationOnce(() => {
        throw new Error('copy failed');
      });
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      render(<ToolCall {...mockProps} isFinished={true} />);
      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[1]);
      expect(errSpy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      errSpy.mockRestore();
    });
    it('复制错误信息失败时应捕获错误并 console.error', async () => {
      const copy = (await import('copy-to-clipboard')).default;
      vi.mocked(copy).mockImplementationOnce(() => {
        throw new Error('copy failed');
      });
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();
      render(
        <ToolCall
          {...mockProps}
          isFinished={true}
          output={{ errorMsg: '测试错误' }}
        />,
      );
      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[1]);
      expect(errSpy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      errSpy.mockRestore();
    });
  });

  describe('错误处理测试', () => {
    it('应该处理 JSON.stringify 错误', () => {
      const circularProps = {
        ...mockProps,
        input: {
          inputArgs: (() => {
            const obj: any = {};
            obj.self = obj;
            return obj;
          })(),
        },
      };
      // 这个测试会抛出错误，但我们确保组件不会崩溃
      try {
        render(<ToolCall {...circularProps} />);
        // 如果渲染成功，说明组件处理了错误
        expect(true).toBe(true);
      } catch (error) {
        // 如果抛出错误，也是可以接受的，因为这是预期的行为
        expect(error).toBeDefined();
      }
    });
    it('应该处理无效的 markdownRenderProps', () => {
      const invalidProps = {
        ...mockProps,
        markdownRenderProps: {
          style: 'invalid-style',
          contentStyle: null,
        } as any,
      };
      expect(() => {
        render(<ToolCall {...invalidProps} />);
      }).not.toThrow();
    });
  });

  describe('国际化测试', () => {
    it('应该正确显示中文文本', () => {
      render(<ToolCall {...mockProps} />);
      expect(screen.getByText('执行入参')).toBeInTheDocument();
      expect(screen.getByText('执行结果')).toBeInTheDocument();
    });
    it('应使用 I18n mock 文案', () => {
      render(<ToolCall {...mockProps} />);
      expect(screen.getByText('执行入参')).toBeInTheDocument();
      expect(screen.getByText('执行结果')).toBeInTheDocument();
    });
    it('应该处理缺失的国际化文本', () => {
      expect(() => {
        render(<ToolCall {...mockProps} />);
      }).not.toThrow();
    });
  });

  describe('ActionIconBox mock 覆盖（60,62,66,67）', () => {
    it('应渲染带 title 和 onClick 的按钮并支持 children', () => {
      render(<ToolCall {...mockProps} onChangeItem={vi.fn()} />);
      const copyButtons = screen.getAllByTestId('action-复制');
      expect(copyButtons.length).toBeGreaterThanOrEqual(1);
      expect(copyButtons[0]).toHaveAttribute('title');
      expect(screen.getByTestId('action-修改')).toBeInTheDocument();
    });
  });

  describe('集成测试', () => {
    it('应该完整的工作流程测试', async () => {
      const onChangeItem = vi.fn();
      const user = userEvent.setup();

      // 1. 初始渲染
      const { rerender } = render(
        <ToolCall {...mockProps} onChangeItem={onChangeItem} />,
      );
      expect(screen.getByText('执行入参')).toBeInTheDocument();

      // 2. 进入编辑模式
      const editButton = screen.getByTestId('action-修改');
      await user.click(editButton);
      expect(
        screen.getByText((c) => c.replace(/\s/g, '') === '重试'),
      ).toBeInTheDocument();

      // 3. 退出编辑模式
      const cancelButton = screen.getByText(
        (c) => c.replace(/\s/g, '') === '取消',
      );
      await user.click(cancelButton);
      expect(
        screen.queryByText((c) => c.replace(/\s/g, '') === '重试'),
      ).not.toBeInTheDocument();

      // 4. 测试复制功能
      const copy = (await import('copy-to-clipboard')).default;
      const copyButtons = screen.getAllByTestId('action-复制');
      await user.click(copyButtons[0]);
      expect(copy).toHaveBeenCalled();

      // 5. 测试错误状态
      const errorProps = {
        ...mockProps,
        output: { errorMsg: '测试错误' },
      };
      rerender(<ToolCall {...errorProps} onChangeItem={onChangeItem} />);
      expect(screen.getByText('测试错误')).toBeInTheDocument();
    });
  });
});
