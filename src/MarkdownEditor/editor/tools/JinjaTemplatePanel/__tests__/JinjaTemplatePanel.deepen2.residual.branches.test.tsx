/**
 * JinjaTemplatePanel deepen2 residual：clickOutside 150ms 内忽略、items 失败、
 * 无 DOM 节点 catch、Enter 空 items、prefix 回退。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { I18nProvide } from '../../../../../I18n';
import { useEditorStore } from '../../../store';
import { JinjaTemplatePanel } from '../index';

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

vi.mock('../../../utils/editorUtils', () => ({
  EditorUtils: { focus: vi.fn() },
}));

vi.mock('../style', () => ({
  JINJA_PANEL_PREFIX_CLS: 'agentic-md-editor-jinja-panel',
  useJinjaTemplatePanelStyle: () => ({ hashId: 'h' }),
}));

vi.mock('slate', () => ({
  Editor: {
    node: vi.fn(() => [{ type: 'paragraph', children: [{ text: '{{' }] }]),
    end: vi.fn(() => ({ path: [0, 0], offset: 2 })),
    before: vi.fn(() => ({ path: [0, 0], offset: 0 })),
  },
  Transforms: { delete: vi.fn(), insertText: vi.fn() },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          bottom: 10,
          width: 100,
          height: 10,
          right: 100,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      return el;
    }),
  },
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    ConfigProvider: {
      ...actual.ConfigProvider,
      ConfigContext: React.createContext({
        getPrefixCls: undefined,
      }),
    },
  };
});

describe('JinjaTemplatePanel deepen2 residual branches', () => {
  const setOpen = vi.fn();
  const setAnchor = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('打开后 150ms 内外部 click 忽略；之后关闭', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: true,
      setOpenJinjaTemplate: setOpen,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: [0, 0],
      markdownEditorRef: { current: {} },
      editorProps: {
        jinja: {
          templatePanel: {
            items: [{ title: 'A', template: '{{a}}' }],
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.click(document.body);
    expect(setOpen).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(160);
    });
    fireEvent.click(document.body);
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it('itemsConfig reject 回退 defaultItems；Editor.node 抛错定位', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(Editor.node).mockImplementationOnce(() => {
      throw new Error('stale path');
    });
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: true,
      setOpenJinjaTemplate: setOpen,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: [0, 0],
      markdownEditorRef: { current: {} },
      editorProps: {
        jinja: {
          templatePanel: {
            items: vi.fn(async () => {
              throw new Error('load fail');
            }),
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    errSpy.mockRestore();
  });

  it('items 为空时 Enter 不 insert；无 itemsConfig 用 default', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: true,
      setOpenJinjaTemplate: setOpen,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: [0, 0],
      markdownEditorRef: { current: {} },
      editorProps: {
        jinja: {
          templatePanel: {
            items: [],
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('toDOMNode 返回 null 时不崩', () => {
    vi.mocked(ReactEditor.toDOMNode).mockReturnValueOnce(null as any);
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: true,
      setOpenJinjaTemplate: setOpen,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: [0, 0],
      markdownEditorRef: { current: {} },
      editorProps: {},
    } as any);
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});
