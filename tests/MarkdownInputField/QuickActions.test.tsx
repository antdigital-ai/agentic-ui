import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickActions } from '../../src/MarkdownInputField/QuickActions';

// Mock RefinePromptButton
vi.mock('../../src/MarkdownInputField/RefinePromptButton', () => ({
  RefinePromptButton: ({
    onRefine,
    isHover,
    disabled,
    status,
    ...props
  }: any) => (
    <button
      type="button"
      data-testid="refine-prompt-button"
      onClick={onRefine}
      disabled={disabled}
      data-hover={isHover}
      data-status={status}
      {...props}
    >
      Refine
    </button>
  ),
}));

vi.mock('../../src/MarkdownInputField/Enlargement', () => ({
  __esModule: true,
  default: ({
    isEnlarged,
    onEnlargeClick,
    ...rest
  }: {
    isEnlarged?: boolean;
    onEnlargeClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid="enlargement-toggle"
      data-enlarged={isEnlarged}
      onClick={onEnlargeClick}
      {...rest}
    >
      {isEnlarged ? 'Shrink' : 'Enlarge'}
    </button>
  ),
}));

let capturedOnResize: ((e: { offsetWidth: number }) => void) | null = null;
vi.mock('rc-resize-observer', () => {
  const React = require('react');
  return {
    default: ({ children, onResize }: any) => {
      if (onResize) {
        capturedOnResize = onResize;
        try {
          onResize({ offsetWidth: 100 });
        } catch (_) {}
        React.useEffect(() => {
          onResize({ offsetWidth: 200 });
        }, []);
      }
      return children;
    },
  };
});

describe('QuickActions', () => {
  const mockEditorRef = {
    current: {
      store: {
        getMDContent: vi.fn().mockReturnValue(''),
        setMDContent: vi.fn(),
      },
    },
  };

  const mockOnValueChange = vi.fn();
  const mockOnResize = vi.fn();

  const defaultProps = {
    value: 'test value',
    isHover: false,
    isLoading: false,
    disabled: false,
    fileUploadStatus: 'done' as const,
    editorRef: mockEditorRef as any,
    onValueChange: mockOnValueChange,
    prefixCls: 'test-prefix',
    hashId: 'test-hash',
    onResize: mockOnResize,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditorRef.current.store.getMDContent.mockReturnValue('test value');
  });

  afterEach(async () => {
    // 等待所有挂起的 Promise 完成，避免在测试清理后仍有异步操作
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  describe('基本渲染', () => {
    it('应该在启用提示词优化时渲染优化按钮', () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      expect(screen.getByTestId('refine-prompt-button')).toBeInTheDocument();
    });

    it('应在 enable 为 false 时仍渲染按钮但点击不调用 onRefine', () => {
      const onRefine = vi.fn();
      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{ enable: false, onRefine }}
        />,
      );
      expect(screen.getByTestId('refine-prompt-button')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('refine-prompt-button'));
      expect(onRefine).not.toHaveBeenCalled();
    });

    it('应该在没有提示词优化配置时不渲染优化按钮', () => {
      render(<QuickActions {...defaultProps} />);

      expect(
        screen.queryByTestId('refine-prompt-button'),
      ).not.toBeInTheDocument();
    });
  });

  describe('放大功能', () => {
    it('应该在启用放大功能时渲染放大按钮', () => {
      const { container } = render(
        <QuickActions {...defaultProps} enlargeable={true} />,
      );

      expect(screen.getByTestId('enlargement-toggle')).toBeInTheDocument();
      expect(
        container.querySelector('.test-prefix-quick-actions-vertical'),
      ).toBeInTheDocument();
    });

    it('应该将放大状态传递给放大按钮', () => {
      render(
        <QuickActions {...defaultProps} enlargeable={true} isEnlarged={true} />,
      );

      expect(screen.getByTestId('enlargement-toggle')).toHaveAttribute(
        'data-enlarged',
        'true',
      );
    });

    it('应该在点击放大按钮时触发回调', () => {
      const handleEnlargeClick = vi.fn();

      render(
        <QuickActions
          {...defaultProps}
          enlargeable={true}
          onEnlargeClick={handleEnlargeClick}
        />,
      );

      fireEvent.click(screen.getByTestId('enlargement-toggle'));
      expect(handleEnlargeClick).toHaveBeenCalledTimes(1);
    });

    it('应该在未启用放大功能时不渲染放大按钮', () => {
      const { container } = render(<QuickActions {...defaultProps} />);

      expect(
        screen.queryByTestId('enlargement-toggle'),
      ).not.toBeInTheDocument();
      expect(
        container.querySelector('.test-prefix-quick-actions-vertical'),
      ).not.toBeInTheDocument();
    });
  });

  describe('提示词优化功能', () => {
    it('应该成功执行提示词优化', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');
      mockEditorRef.current.store.getMDContent.mockReturnValue('original text');

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      await act(async () => {
        fireEvent.click(refineButton);
      });

      await waitFor(
        () => {
          expect(mockOnRefine).toHaveBeenCalledWith('original text');
          expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
            'refined text',
          );
          expect(mockOnValueChange).toHaveBeenCalledWith('refined text');
        },
        { timeout: 1000 },
      );

      // 确保所有异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });

    it('应该从编辑器获取当前内容', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');
      mockEditorRef.current.store.getMDContent.mockReturnValue(
        'editor content',
      );

      render(
        <QuickActions
          {...defaultProps}
          value="prop value"
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      await act(async () => {
        fireEvent.click(refineButton);
      });

      await waitFor(
        () => {
          expect(mockOnRefine).toHaveBeenCalledWith('editor content');
        },
        { timeout: 1000 },
      );

      // 确保所有异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });

    it('应该在编辑器内容为空时使用 value prop', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('refined text');
      mockEditorRef.current.store.getMDContent.mockReturnValue(undefined);

      render(
        <QuickActions
          {...defaultProps}
          value="fallback value"
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      await act(async () => {
        fireEvent.click(refineButton);
      });

      await waitFor(
        () => {
          expect(mockOnRefine).toHaveBeenCalledWith('fallback value');
        },
        { timeout: 1000 },
      );

      // 确保所有异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });

    it('应该处理优化失败的情况', async () => {
      const mockOnRefine = vi
        .fn()
        .mockRejectedValue(new Error('Refine failed'));

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      await act(async () => {
        fireEvent.click(refineButton);
      });

      await waitFor(
        async () => {
          expect(mockOnRefine).toHaveBeenCalled();
          // 应该不会更新内容
          expect(
            mockEditorRef.current.store.setMDContent,
          ).not.toHaveBeenCalled();
        },
        { timeout: 1000 },
      );

      // 确保所有异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });

    it('应该在正在加载时不重复执行优化', async () => {
      const mockOnRefine = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve('refined text'), 100);
          }),
      );

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      // 第一次点击
      await act(async () => {
        fireEvent.click(refineButton);
        // 等待状态更新完成（refineStatus 变为 'loading'）
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // 第二次点击（此时应该被阻止，因为状态已经是 'loading'）
      await act(async () => {
        fireEvent.click(refineButton);
      });

      // 验证只调用了一次
      expect(mockOnRefine).toHaveBeenCalledTimes(1);

      // 等待所有异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });
    });

    it('应该处理返回空字符串的情况', async () => {
      const mockOnRefine = vi.fn().mockResolvedValue('');

      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{
            enable: true,
            onRefine: mockOnRefine,
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');

      await act(async () => {
        fireEvent.click(refineButton);
      });

      await waitFor(
        () => {
          expect(mockEditorRef.current.store.setMDContent).toHaveBeenCalledWith(
            '',
          );
          expect(mockOnValueChange).toHaveBeenCalledWith('');
        },
        { timeout: 1000 },
      );

      // 确保所有异步操作完成
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    });

    it('应该在 enable 为 true 但 onRefine 缺失时不执行优化（111）', async () => {
      render(
        <QuickActions
          {...defaultProps}
          refinePrompt={{ enable: true }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      await act(async () => {
        fireEvent.click(refineButton);
      });

      expect(mockEditorRef.current.store.setMDContent).not.toHaveBeenCalled();
      expect(mockOnValueChange).not.toHaveBeenCalled();
    });
  });

  describe('自定义渲染', () => {
    it('应该支持自定义快速操作', () => {
      const customRender = vi.fn(() => [
        <div key="custom" data-testid="custom-action">
          Custom Action
        </div>,
      ]);

      render(
        <QuickActions
          {...defaultProps}
          quickActionRender={customRender}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      expect(customRender).toHaveBeenCalled();
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
      expect(screen.getByTestId('refine-prompt-button')).toBeInTheDocument();
    });

    it('应该传递正确的 props 给自定义渲染函数', () => {
      const customRender = vi.fn(() => []);

      const fileMap = new Map();
      fileMap.set('file1', { uuid: 'file1' } as any);

      render(
        <QuickActions
          {...defaultProps}
          value="test"
          fileMap={fileMap}
          isHover={true}
          isLoading={true}
          fileUploadStatus="uploading"
          quickActionRender={customRender}
        />,
      );

      expect(customRender).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 'test',
          fileMap,
          isHover: true,
          isLoading: true,
          fileUploadStatus: 'uploading',
        }),
      );
    });

    it('应该支持只有自定义操作', () => {
      const customRender = vi.fn(() => [
        <div key="custom" data-testid="custom-only">
          Custom Only
        </div>,
      ]);

      render(
        <QuickActions {...defaultProps} quickActionRender={customRender} />,
      );

      expect(screen.getByTestId('custom-only')).toBeInTheDocument();
      expect(
        screen.queryByTestId('refine-prompt-button'),
      ).not.toBeInTheDocument();
    });
  });

  describe('悬停状态', () => {
    it('应该传递悬停状态给优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          isHover={true}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).toHaveAttribute('data-hover', 'true');
    });

    it('应该传递非悬停状态给优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          isHover={false}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).toHaveAttribute('data-hover', 'false');
    });
  });

  describe('禁用状态', () => {
    it('应该在禁用时禁用优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          disabled={true}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).toBeDisabled();
    });

    it('应该在未禁用时启用优化按钮', () => {
      render(
        <QuickActions
          {...defaultProps}
          disabled={false}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      const refineButton = screen.getByTestId('refine-prompt-button');
      expect(refineButton).not.toBeDisabled();
    });
  });

  describe('文件映射表', () => {
    it('应该支持文件映射表的更新', () => {
      const mockOnFileMapChange = vi.fn();
      const fileMap = new Map();
      fileMap.set('file1', { uuid: 'file1' } as any);

      const customRender = (props: any) => {
        // 测试是否能调用 onFileMapChange
        if (props.onFileMapChange) {
          const newMap = new Map(props.fileMap);
          newMap.set('file2', { uuid: 'file2' });
          props.onFileMapChange(newMap);
        }
        return [];
      };

      render(
        <QuickActions
          {...defaultProps}
          fileMap={fileMap}
          onFileMapChange={mockOnFileMapChange}
          quickActionRender={customRender}
        />,
      );

      expect(mockOnFileMapChange).toHaveBeenCalled();
    });
  });

  describe('Resize 观察', () => {
    it('应该在尺寸变化时调用 onResize 回调', async () => {
      const mockOnResize = vi.fn();
      const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        right: '12px',
        getPropertyValue: vi.fn(),
      } as any);

      const ref = React.createRef<HTMLDivElement>();
      render(
        <QuickActions
          {...defaultProps}
          ref={ref}
          onResize={mockOnResize}
          refinePrompt={{
            enable: true,
            onRefine: vi.fn(),
          }}
        />,
      );

      await waitFor(
        () => {
          expect(mockOnResize).toHaveBeenCalled();
          expect(mockOnResize).toHaveBeenCalledWith(100, 0);
          expect(mockOnResize).toHaveBeenCalledWith(200, expect.any(Number));
        },
        { timeout: 500 },
      );

      getComputedStyleSpy.mockRestore();
    });

    it('应该在 window 为 undefined 时调用 onResize(width, 0)', async () => {
      const mockOnResize = vi.fn();
      render(
        <QuickActions
          {...defaultProps}
          onResize={mockOnResize}
        />,
      );

      await waitFor(() => {
        expect(capturedOnResize).not.toBeNull();
      });

      const origWindow = globalThis.window;
      (globalThis as any).window = undefined;
      try {
        capturedOnResize!({ offsetWidth: 50 });
        expect(mockOnResize).toHaveBeenCalledWith(50, 0);
      } finally {
        (globalThis as any).window = origWindow;
      }
    });

    it('应该在 onResize 内部抛出时静默捕获（141）', () => {
      const mockOnResize = vi.fn();
      vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
        throw new Error('getComputedStyle error');
      });

      render(
        <QuickActions
          {...defaultProps}
          onResize={mockOnResize}
        />,
      );

      expect(mockOnResize).toHaveBeenCalledWith(100, 0);
      vi.restoreAllMocks();
    });
  });

  describe('div 事件：onBlur / onFocus / onKeyDown（148, 151, 159, 160）', () => {
    it('应该触发 blur/focus/keyDown 处理器', () => {
      const { container } = render(
        <QuickActions {...defaultProps} refinePrompt={{ enable: true, onRefine: vi.fn() }} />,
      );

      const quickActionsDiv = container.querySelector('.test-prefix-quick-actions');
      expect(quickActionsDiv).toBeInTheDocument();

      fireEvent.blur(quickActionsDiv!);
      fireEvent.focus(quickActionsDiv!);
      fireEvent.keyDown(quickActionsDiv!, { key: 'Enter' });
    });
  });
});
