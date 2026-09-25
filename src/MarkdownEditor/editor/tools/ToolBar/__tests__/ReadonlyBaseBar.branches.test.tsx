/**
 * ReadonlyBaseBar 分支覆盖：无 selection + DOM 恢复、选区方向、
 * locale 回退、comment 关闭、空选区早退、onSubmit 异常吞掉。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Modal } from 'antd';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const onSubmit = vi.fn(async () => undefined);
const getSelectionFromDomSelection = vi.fn();
const getPointStrOffset = vi.fn(() => 0);
const setNodes = vi.fn();
const fragment = vi.fn(() => [
  { type: 'paragraph', children: [{ text: 'Sel' }] },
]);
const stringFn = vi.fn(() => 'Sel');

let editorSelection: any = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 3 },
};
let commentEnable = true;
let commentPlaceholder: string | undefined = undefined;
let pointIsAfter = true;
let locale: Record<string, string> | undefined = { addComment: 'Add C' };

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn(() => true),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<any>('antd');
  return {
    ...actual,
    Modal: { confirm: vi.fn() },
    Input: {
      TextArea: (props: any) => (
        <textarea data-testid="comment-ta" {...props} />
      ),
    },
  };
});

vi.mock('../../../../../I18n', () => ({
  I18nContext: React.createContext({
    get locale() {
      return locale;
    },
  }),
}));

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    floatBarRevision: 1,
    refreshFloatBar: false,
    markdownEditorRef: {
      current: {
        get selection() {
          return editorSelection;
        },
        set selection(v: any) {
          editorSelection = v;
        },
        children: [{ type: 'paragraph', children: [{ text: 'Sel' }] }],
      },
    },
    get editorProps() {
      return {
        comment: commentEnable
          ? {
              enable: true,
              onSubmit,
              placeholder: commentPlaceholder,
            }
          : { enable: false },
      };
    },
  }),
}));

vi.mock('../../../utils/editorUtils', () => ({
  getPointStrOffset: (...args: any[]) => getPointStrOffset(...args),
  getSelectionFromDomSelection: (...args: any[]) =>
    getSelectionFromDomSelection(...args),
}));

vi.mock('../../../utils/resolveEditorPlaceholder', () => ({
  resolveEditorPlaceholderFromProps: () => 'ph',
}));

vi.mock('slate', async () => {
  const actual = await vi.importActual<any>('slate');
  return {
    ...actual,
    Editor: {
      ...actual.Editor,
      nodes: vi.fn(function* () {
        yield [{ type: 'paragraph', children: [{ text: 'Sel' }] }, [0]];
      }),
    },
    Node: {
      ...actual.Node,
      fragment: (...a: any[]) => fragment(...a),
      string: (...a: any[]) => stringFn(...a),
    },
    Point: {
      ...actual.Point,
      isAfter: () => pointIsAfter,
    },
    Transforms: {
      ...actual.Transforms,
      setNodes: (...a: any[]) => setNodes(...a),
    },
  };
});

import { ReadonlyBaseBar } from '../ReadonlyBaseBar';

describe('ReadonlyBaseBar 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    editorSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    };
    commentEnable = true;
    commentPlaceholder = undefined;
    pointIsAfter = true;
    locale = { addComment: 'Add C' };
    getSelectionFromDomSelection.mockReturnValue({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    });
    onSubmit.mockResolvedValue(undefined);
  });

  it('comment 关闭时仅渲染复制按钮', () => {
    commentEnable = false;
    render(<ReadonlyBaseBar prefix="rb" />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('无 editor.selection 时从 DOM selection 恢复并提交 highlight', async () => {
    editorSelection = null;
    const selSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'Sel',
      rangeCount: 1,
    } as any);
    render(<ReadonlyBaseBar prefix="rb" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() => {
      expect(getSelectionFromDomSelection).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ commentType: 'highlight' }),
      );
    });
    expect(setNodes).toHaveBeenCalled();
    selSpy.mockRestore();
  });

  it('无 selection 且 DOM 恢复失败时早退', async () => {
    editorSelection = null;
    getSelectionFromDomSelection.mockReturnValue(null);
    const selSpy = vi
      .spyOn(window, 'getSelection')
      .mockReturnValue(null as any);
    render(<ReadonlyBaseBar prefix="rb" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
    selSpy.mockRestore();
  });

  it('Point.isAfter=false 时交换 start/end', async () => {
    pointIsAfter = false;
    render(<ReadonlyBaseBar prefix="rb" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(getPointStrOffset).toHaveBeenCalled();
  });

  it('locale 缺省时评论标题回退「添加评论」', async () => {
    locale = undefined;
    render(<ReadonlyBaseBar />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    await waitFor(() => {
      expect(Modal.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ title: '添加评论' }),
      );
    });
  });

  it('comment.placeholder 优先于 resolveEditorPlaceholder', async () => {
    commentPlaceholder = '自定义占位';
    render(<ReadonlyBaseBar prefix="rb" />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    await waitFor(() => expect(Modal.confirm).toHaveBeenCalled());
    const cfg = (Modal.confirm as any).mock.calls.at(-1)[0];
    const { container } = render(cfg.content);
    expect(container.querySelector('textarea')?.placeholder).toBe('自定义占位');
  });

  it('评论 onOk 内容非空但 onSubmit 抛错时被吞掉', async () => {
    onSubmit.mockRejectedValueOnce(new Error('fail'));
    render(<ReadonlyBaseBar prefix="rb" />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    await waitFor(() => expect(Modal.confirm).toHaveBeenCalled());
    const cfg = (Modal.confirm as any).mock.calls.at(-1)[0];
    render(cfg.content);
    fireEvent.change(screen.getByTestId('comment-ta'), {
      target: { value: 'ok' },
    });
    await expect(cfg.onOk()).resolves.toBeUndefined();
  });

  it('复制按钮在无 selection 时走 DOM 恢复', async () => {
    editorSelection = null;
    const selSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'Sel',
      rangeCount: 1,
    } as any);
    render(<ReadonlyBaseBar prefix="rb" />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(getSelectionFromDomSelection).toHaveBeenCalled();
    });
    selSpy.mockRestore();
  });

  it('复制按钮在完全无 selection 时早退', async () => {
    editorSelection = null;
    getSelectionFromDomSelection.mockReturnValue(null);
    vi.spyOn(window, 'getSelection').mockReturnValue(null as any);
    render(<ReadonlyBaseBar prefix="rb" />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[buttons.length - 1]);
    await waitFor(() => {
      expect(fragment).not.toHaveBeenCalled();
    });
  });

  it('评论按钮无 selection 时从 DOM 恢复', async () => {
    editorSelection = null;
    const selSpy = vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'Sel',
      rangeCount: 1,
    } as any);
    render(<ReadonlyBaseBar prefix="rb" />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    await waitFor(() => {
      expect(getSelectionFromDomSelection).toHaveBeenCalled();
      expect(Modal.confirm).toHaveBeenCalled();
    });
    selSpy.mockRestore();
  });
});
