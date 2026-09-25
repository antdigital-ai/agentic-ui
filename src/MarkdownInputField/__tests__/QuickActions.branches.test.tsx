/**
 * QuickActions 分支覆盖：refine、enlarge、resize、quickActionRender。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { QuickActions } from '../QuickActions';

vi.mock('../RefinePromptButton', () => ({
  RefinePromptButton: ({
    onRefine,
    disabled,
    status,
  }: {
    onRefine?: () => void;
    disabled?: boolean;
    status?: string;
  }) => (
    <button
      type="button"
      data-testid="refine-prompt-button"
      data-status={status}
      disabled={disabled}
      onClick={onRefine}
    >
      Refine
    </button>
  ),
}));

vi.mock('../Enlargement', () => ({
  __esModule: true,
  default: ({
    isEnlarged,
    onEnlargeClick,
  }: {
    isEnlarged?: boolean;
    onEnlargeClick?: () => void;
  }) => (
    <button
      type="button"
      data-testid="enlargement-toggle"
      data-enlarged={String(!!isEnlarged)}
      onClick={onEnlargeClick}
    >
      enlarge
    </button>
  ),
}));

let lastOnResize: ((e: { offsetWidth: number }) => void) | null = null;
vi.mock('rc-resize-observer', () => {
  const ReactLib = require('react');
  const ResizeObserverMock = ({
    children,
    onResize,
  }: {
    children: React.ReactNode;
    onResize?: (e: { offsetWidth: number }) => void;
  }) => {
    ReactLib.useEffect(() => {
      lastOnResize = onResize || null;
      onResize?.({ offsetWidth: 120 });
    }, [onResize]);
    return children;
  };
  return { default: ResizeObserverMock };
});

describe('QuickActions branches', () => {
  it('无 refine/enlarge/render 时渲染空容器', () => {
    render(<QuickActions />);
    expect(screen.getByTestId('markdown-input-field-quick-actions')).toBeInTheDocument();
  });

  it('enlargeable 渲染放大按钮', () => {
    const onEnlargeClick = vi.fn();
    render(
      <QuickActions
        enlargeable
        isEnlarged
        onEnlargeClick={onEnlargeClick}
      />,
    );
    fireEvent.click(screen.getByTestId('enlargement-toggle'));
    expect(onEnlargeClick).toHaveBeenCalled();
  });

  it('quickActionRender 注入自定义节点', () => {
    render(
      <QuickActions
        quickActionRender={() => [
          <button key="q" type="button" data-testid="custom-qa">
            QA
          </button>,
        ]}
      />,
    );
    expect(screen.getByTestId('custom-qa')).toBeInTheDocument();
  });

  it('refinePrompt enable=false 时点击不调用 onRefine', async () => {
    const onRefine = vi.fn();
    render(
      <QuickActions
        refinePrompt={{ enable: false, onRefine }}
        value="hi"
      />,
    );
    fireEvent.click(screen.getByTestId('refine-prompt-button'));
    expect(onRefine).not.toHaveBeenCalled();
  });

  it('refine 成功写入编辑器与 onValueChange', async () => {
    const setMDContent = vi.fn();
    const getMDContent = vi.fn().mockReturnValue('raw');
    const onValueChange = vi.fn();
    const onRefine = vi.fn().mockResolvedValue('refined');
    render(
      <QuickActions
        refinePrompt={{ enable: true, onRefine }}
        editorRef={{ current: { store: { setMDContent, getMDContent } } } as any}
        onValueChange={onValueChange}
        value="fallback"
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('refine-prompt-button'));
    });
    await waitFor(() => expect(onRefine).toHaveBeenCalledWith('raw'));
    expect(setMDContent).toHaveBeenCalledWith('refined');
    expect(onValueChange).toHaveBeenCalledWith('refined');
  });

  it('refine 失败仍回到 idle', async () => {
    const onRefine = vi.fn().mockRejectedValue(new Error('fail'));
    render(
      <QuickActions refinePrompt={{ enable: true, onRefine }} value="x" />,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('refine-prompt-button'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('refine-prompt-button')).toHaveAttribute(
        'data-status',
        'idle',
      ),
    );
  });

  it('refine 无 onRefine 早退', async () => {
    render(
      <QuickActions refinePrompt={{ enable: true } as any} value="x" />,
    );
    fireEvent.click(screen.getByTestId('refine-prompt-button'));
    expect(screen.getByTestId('refine-prompt-button')).toHaveAttribute(
      'data-status',
      'idle',
    );
  });

  it('无 editor 时用 value 作为 refine 输入', async () => {
    const onRefine = vi.fn().mockResolvedValue(null);
    const onValueChange = vi.fn();
    render(
      <QuickActions
        refinePrompt={{ enable: true, onRefine }}
        value="from-prop"
        onValueChange={onValueChange}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('refine-prompt-button'));
    });
    await waitFor(() => expect(onRefine).toHaveBeenCalledWith('from-prop'));
    expect(onValueChange).toHaveBeenCalledWith('');
  });

  it('onResize 在无 ref.current 时 offset=0', () => {
    const onResize = vi.fn();
    render(<QuickActions onResize={onResize} />);
    expect(onResize).toHaveBeenCalled();
    expect(lastOnResize).toBeTruthy();
  });

  it('onResize 读取 computedStyle.right', () => {
    const onResize = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    render(<QuickActions ref={ref} onResize={onResize} />);
    const getComputedStyle = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ right: '12px' } as any);
    act(() => {
      lastOnResize?.({ offsetWidth: 200 });
    });
    expect(onResize).toHaveBeenCalledWith(200, 12);
    getComputedStyle.mockRestore();
  });

  it('right 解析 NaN 时用 0', () => {
    const onResize = vi.fn();
    const ref = React.createRef<HTMLDivElement>();
    render(<QuickActions ref={ref} onResize={onResize} />);
    const getComputedStyle = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ right: 'not-a-number' } as any);
    act(() => {
      lastOnResize?.({ offsetWidth: 80 });
    });
    expect(onResize).toHaveBeenCalledWith(80, 0);
    getComputedStyle.mockRestore();
  });

  it('容器 click/keydown/blur/focus stopPropagation', () => {
    render(<QuickActions refinePrompt={{ enable: true, onRefine: vi.fn() }} />);
    const root = screen.getByTestId('markdown-input-field-quick-actions');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stop = vi.spyOn(click, 'stopPropagation');
    root.dispatchEvent(click);
    expect(stop).toHaveBeenCalled();
    fireEvent.keyDown(root, { key: 'Enter' });
    fireEvent.blur(root);
    fireEvent.focus(root);
  });

  it('disabled 透传到 RefinePromptButton', () => {
    render(
      <QuickActions
        disabled
        refinePrompt={{ enable: true, onRefine: vi.fn() }}
      />,
    );
    expect(screen.getByTestId('refine-prompt-button')).toBeDisabled();
  });
});
