/**
 * JinjaTemplatePanel deepen residual：loading/close/insert 早退、定位、items 异步非数组。
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

describe('JinjaTemplatePanel deepen residual branches', () => {
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

  it('openJinjaTemplate false 不渲染', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: false,
      setOpenJinjaTemplate: setOpen,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: [0, 0],
      markdownEditorRef: { current: {} },
      editorProps: {},
    } as any);
    const { container } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(container.querySelector('[role="listbox"]')).toBeNull();
  });

  it('loading / description / close / mouseEnter / 面板内点击不关闭', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: true,
      setOpenJinjaTemplate: setOpen,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: [0, 0],
      markdownEditorRef: { current: { selection: {} } },
      editorProps: {
        jinja: {
          docLink: 'https://docs/jinja',
          templatePanel: {
            items: vi.fn(
              () =>
                new Promise((resolve) =>
                  setTimeout(
                    () =>
                      resolve([
                        {
                          title: 'T1',
                          template: '{{a}}',
                          description: 'desc',
                        },
                      ]),
                    50,
                  ),
                ),
            ),
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(60);
    });
    expect(await screen.findByText('T1')).toBeInTheDocument();
    expect(screen.getByText('desc')).toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByText('T1'));
    fireEvent.click(
      document.querySelector('.ant-agentic-md-editor-jinja-panel-close')!,
    );
    expect(setOpen).toHaveBeenCalledWith(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.mouseDown(screen.getByRole('listbox'));
    expect(setOpen).toHaveBeenCalled();
  });

  it('insert 早退：无 editor / 无 anchor / 无 setOpen；async 非数组', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      openJinjaTemplate: true,
      setOpenJinjaTemplate: undefined,
      setJinjaAnchorPath: setAnchor,
      jinjaAnchorPath: null,
      markdownEditorRef: { current: null },
      editorProps: {
        jinja: {
          templatePanel: {
            items: vi.fn(async () => 'not-array' as any),
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
    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('上方定位分支；Esc / Arrow / Enter 键盘', async () => {
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 100,
    });
    vi.mocked(ReactEditor.toDOMNode).mockImplementation(() => {
      const el = document.createElement('div');
      el.getBoundingClientRect = () =>
        ({
          left: 10,
          top: 90,
          bottom: 95,
          width: 40,
          height: 5,
          right: 50,
          x: 10,
          y: 90,
          toJSON: () => ({}),
        }) as DOMRect;
      return el;
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
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(Transforms.insertText).toHaveBeenCalled();
    expect(Editor.end).toHaveBeenCalled();
  });
});
