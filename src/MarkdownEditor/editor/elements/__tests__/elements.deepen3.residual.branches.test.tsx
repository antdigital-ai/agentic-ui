/**
 * elements/index deepen3：TagPopup onSelect 完整路径、
 * setTimeout 早退、placeholder 回退、dirtLeaf selectFormat。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorUtils } from '../../utils/editorUtils';
import { MLeaf } from '../index';

const editorApi = vi.hoisted(() => {
  const ed = {
    focus: vi.fn(),
    children: [],
    delete: vi.fn(),
  };
  return {
    ed,
    markdownEditorRef: { current: ed as any },
    markdownContainerRef: {
      current: {
        querySelector: vi.fn(() => {
          const el = document.createElement('div');
          el.focus = vi.fn();
          return el;
        }),
      },
    },
  };
});

const slateMocks = vi.hoisted(() => ({
  withoutNormalizing: vi.fn((ed: any, fn: () => void) => fn()),
  start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
  end: vi.fn(() => ({ path: [0, 0], offset: 1 })),
  hasPath: vi.fn(() => false),
  delete: vi.fn(),
  insertText: vi.fn(),
  setNodes: vi.fn(),
  insertNodes: vi.fn(),
  select: vi.fn(),
  previous: vi.fn((p: number[]) => {
    const next = [...p];
    next[next.length - 1] -= 1;
    return next;
  }),
  next: vi.fn((p: number[]) => {
    const next = [...p];
    next[next.length - 1] += 1;
    return next;
  }),
  findPath: vi.fn().mockReturnValue([0, 0]),
}));

vi.mock('../../store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: editorApi.markdownEditorRef,
    markdownContainerRef: editorApi.markdownContainerRef,
    readonly: false,
    store: { dragStart: vi.fn(), isLatestNode: vi.fn().mockReturnValue(false) },
    typewriter: false,
    editorProps: {},
  })),
}));

vi.mock('slate', () => ({
  Editor: {
    withoutNormalizing: (...a: any[]) => slateMocks.withoutNormalizing(...a),
    start: (...a: any[]) => slateMocks.start(...a),
    end: (...a: any[]) => slateMocks.end(...a),
    hasPath: (...a: any[]) => slateMocks.hasPath(...a),
  },
  Transforms: {
    delete: (...a: any[]) => slateMocks.delete(...a),
    insertText: (...a: any[]) => slateMocks.insertText(...a),
    setNodes: (...a: any[]) => slateMocks.setNodes(...a),
    insertNodes: (...a: any[]) => slateMocks.insertNodes(...a),
    select: (...a: any[]) => slateMocks.select(...a),
  },
  Path: {
    previous: (...a: any[]) => slateMocks.previous(...a),
    next: (...a: any[]) => slateMocks.next(...a),
  },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: (...a: any[]) => slateMocks.findPath(...a),
  },
  useSlate: () => ({ children: [] }),
}));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: { isDirtLeaf: vi.fn().mockReturnValue(false) },
}));

vi.mock('../TagPopup', () => ({
  TagPopup: ({ children, onSelect, placeholder }: any) => (
    <div
      data-testid="tag-popup-d3"
      data-placeholder={placeholder}
      onClick={() => onSelect?.('val', [0, 1], { meta: 1 })}
    >
      {children}
    </div>
  ),
}));

vi.mock('../FncLeaf', () => ({
  FncLeaf: ({ children }: any) => <span data-testid="fnc-leaf">{children}</span>,
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ConfigProvider: {
      ConfigContext: React.createContext({
        getPrefixCls: (s: string) => `ant-${s}`,
      }),
    },
  };
});

describe('elements/index deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    editorApi.markdownEditorRef.current = editorApi.ed;
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(false);
    slateMocks.hasPath.mockReturnValue(false);
    slateMocks.findPath.mockReturnValue([0, 0]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('TagPopup：完整 onSelect；placeholder 缺省；setTimeout 插入空格', () => {
    render(
      <MLeaf
        leaf={{ text: 't', tag: true, code: true }}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{ enable: true }}
        linkConfig={{}}
      >
        <span>t</span>
      </MLeaf>,
    );
    const popup = screen.getByTestId('tag-popup-d3');
    expect(popup).toHaveAttribute('data-placeholder', '请输入');
    fireEvent.click(popup);
    expect(slateMocks.insertText).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(slateMocks.insertNodes).toHaveBeenCalled();
  });

  it('TagPopup setTimeout：editor 已卸载早退；path 空早退', () => {
    render(
      <MLeaf
        leaf={{ text: 't', tag: true, code: true, placeholder: 'ph' }}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{
          enable: true,
          tagTextRender: (_p: any, t: string) => `X${t}`,
        }}
        linkConfig={{}}
      >
        <span>t</span>
      </MLeaf>,
    );
    fireEvent.click(screen.getByTestId('tag-popup-d3'));
    editorApi.markdownEditorRef.current = null;
    act(() => {
      vi.advanceTimersByTime(1);
    });
    // 不应因 null editor 抛错
    expect(screen.getByTestId('tag-popup-d3')).toHaveAttribute(
      'data-placeholder',
      'ph',
    );
  });

  it('dirtLeaf：findPath 有 path 则 Transforms.select', () => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    const { container } = render(
      <MLeaf
        leaf={{ text: 'bold', bold: true }}
        text={{ text: 'bold' } as any}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>bold</span>
      </MLeaf>,
    );
    const el = container.querySelector('[data-be="text"]') as HTMLElement;
    fireEvent.click(el, { detail: 2 });
    expect(EditorUtils.isDirtLeaf).toHaveBeenCalled();
    expect(slateMocks.select).toHaveBeenCalled();
  });

  it('dirtLeaf：findPath 返回 falsy 跳过 select', () => {
    vi.mocked(EditorUtils.isDirtLeaf).mockReturnValue(true);
    slateMocks.findPath.mockReturnValue(null as any);
    const { container } = render(
      <MLeaf
        leaf={{ text: 'x', italic: true }}
        text={{ text: 'x' } as any}
        attributes={{ 'data-slate-leaf': true }}
        comment={undefined}
        fncProps={{}}
        tagInputProps={{}}
        linkConfig={{}}
      >
        <span>x</span>
      </MLeaf>,
    );
    const el = container.querySelector('[data-be="text"]') as HTMLElement;
    fireEvent.click(el, { detail: 2 });
    expect(slateMocks.select).not.toHaveBeenCalled();
  });
});
