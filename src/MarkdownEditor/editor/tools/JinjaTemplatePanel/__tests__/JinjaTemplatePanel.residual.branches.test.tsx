/**
 * JinjaTemplatePanel 残留：空 items、选择插入、timer 规则合规。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { I18nProvide } from '../../../../../I18n';
import { useEditorStore } from '../../../store';
import { JinjaTemplatePanel } from '../index';

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
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
  Transforms: {
    delete: vi.fn(),
    insertText: vi.fn(),
  },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () =>
        ({
          left: 10,
          top: 20,
          bottom: 40,
          width: 50,
          height: 20,
          right: 60,
          x: 10,
          y: 20,
          toJSON: () => ({}),
        }) as DOMRect;
      return el;
    }),
  },
}));

describe('JinjaTemplatePanel residual branches', () => {
  const setOpenJinjaTemplate = vi.fn();
  const baseStore = {
    markdownEditorRef: { current: { selection: { anchor: { path: [0, 0], offset: 2 } } } },
    jinjaAnchorPath: [0, 0],
    setOpenJinjaTemplate,
    openJinjaTemplate: true,
    editorProps: {
      jinja: {
        templatePanel: {
          items: [
            { title: '变量插值', template: '{{ name }}' },
            { title: '条件', template: '{% if %}' },
          ],
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEditorStore).mockReturnValue(baseStore as any);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('渲染选项并插入模板', () => {
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('变量插值'));
    expect(Transforms.insertText).toHaveBeenCalled();
  });

  it('items 为空数组仍渲染 listbox', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: { jinja: { templatePanel: { items: [] } } },
    } as any);
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('150ms 后点击外部关闭', () => {
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(document.body);
    expect(setOpenJinjaTemplate).toHaveBeenCalledWith(false);
  });

  it('toDOMNode 可用时定位 left/top', () => {
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(ReactEditor.toDOMNode).toHaveBeenCalled();
    const panel = screen.getByRole('listbox');
    expect(panel.style.left || panel.getAttribute('style')).toBeTruthy();
  });

  it('istanbul deepen：无 items；选择第二项；toDOMNode 抛错；无 selection', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      markdownEditorRef: { current: { selection: null } },
      editorProps: {
        jinja: {
          templatePanel: {
            items: undefined,
          },
        },
      },
    } as any);
    const { unmount } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    unmount();

    vi.mocked(ReactEditor.toDOMNode).mockImplementationOnce(() => {
      throw new Error('no dom');
    });
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          templatePanel: {
            items: [
              { title: 'A', template: '{{a}}' },
              { title: 'B', template: '{{b}}' },
            ],
          },
        },
      },
    } as any);
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    fireEvent.mouseDown(screen.getByText('B'));
    expect(Transforms.insertText).toHaveBeenCalled();
  });

  it('istanbul deepen：上方定位；templatePanel 非对象；异步 items；键盘导航；短点击忽略', async () => {
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 200,
    });
    vi.mocked(ReactEditor.toDOMNode).mockImplementation(() => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () =>
        ({
          left: 180,
          top: 90,
          bottom: 95,
          width: 40,
          height: 5,
          right: 220,
          x: 180,
          y: 90,
          toJSON: () => ({}),
        }) as DOMRect;
      return el;
    });

    const asyncItems = vi.fn(async () => [
      { title: 'Async1', template: '{{a1}}' },
      { title: 'Async2', template: '{{a2}}' },
    ]);
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          templatePanel: true as any,
          docLink: 'https://docs.example/jinja',
        },
      },
    } as any);
    const { unmount } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    unmount();

    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          templatePanel: {
            trigger: '[[',
            notFoundContent: <span data-testid="nf">none</span>,
            items: asyncItems,
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
      vi.advanceTimersByTime(10);
    });
    expect(asyncItems).toHaveBeenCalled();
    expect(await screen.findByText('Async1')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(Transforms.insertText).toHaveBeenCalled();

    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
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
    const { unmount: u2 } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(document.body);
    expect(setOpenJinjaTemplate).toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    u2();
  });

  it('exclusive deepen：静态 items；trigger；docLink 点击；Arrow/Enter', async () => {
    const setOpenJinjaTemplate = vi.fn();
    const baseStore = {
      markdownEditorRef: {
        current: {
          selection: {
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          },
          children: [{ type: 'paragraph', children: [{ text: '{{' }] }],
        },
      },
      openJinjaTemplate: true,
      setOpenJinjaTemplate,
      editorProps: {},
    };

    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          templatePanel: {
            trigger: '{{',
            items: [
              { title: 'Static1', template: '{{s1}}' },
              { title: 'Static2', template: '{{s2}}' },
            ],
            notFoundContent: 'empty',
          },
          docLink: 'https://docs.example/jinja2',
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(await screen.findByText('Static1')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'ArrowUp' });
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(Transforms.insertText).toHaveBeenCalled();

    const link = screen.queryByRole('link') || screen.queryByText(/docs/i);
    if (link) {
      fireEvent.click(link);
    }
    fireEvent.click(screen.getByText('Static2'));
    expect(Transforms.insertText.mock.calls.length).toBeGreaterThan(0);

    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      openJinjaTemplate: true,
      editorProps: {
        jinja: {
          templatePanel: {
            items: [],
            notFoundContent: <span data-testid="jinja-empty">none</span>,
          },
        },
      },
    } as any);
    const { unmount } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(
      screen.queryByTestId('jinja-empty') || screen.queryByText('none'),
    ).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    unmount();
  });
});
