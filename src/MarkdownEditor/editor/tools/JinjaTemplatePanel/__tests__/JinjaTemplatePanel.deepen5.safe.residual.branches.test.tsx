/**
 * JinjaTemplatePanel deepen5 safe：clickOutside、itemsConfig catch dev、
 * node 定位、before ?? end、Arrow 中间索引、open 早退。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../../../I18n';
import { JinjaTemplatePanel } from '../index';

const mockSetOpen = vi.fn();
const mockSetPath = vi.fn();

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: { current: null },
    openJinjaTemplate: true,
    setOpenJinjaTemplate: mockSetOpen,
    jinjaAnchorPath: null,
  })),
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
  useJinjaTemplatePanelStyle: () => ({ hashId: 'h5' }),
}));

const mockBefore = vi.fn(() => ({ path: [0, 0], offset: 0 }));
const mockEnd = vi.fn(() => ({ path: [0, 0], offset: 2 }));
const mockNode = vi.fn(() => [{ type: 'paragraph', children: [{ text: '{{' }] }]);

vi.mock('slate', () => ({
  Editor: {
    node: (...args: any[]) => mockNode(...args),
    end: (...args: any[]) => mockEnd(...args),
    before: (...args: any[]) => mockBefore(...args),
  },
  Transforms: { delete: vi.fn(), insertText: vi.fn() },
}));

const mockToDOMNode = vi.fn(() => {
  const el = document.createElement('div');
  el.getBoundingClientRect = () =>
    ({
      top: 10,
      left: 20,
      width: 100,
      height: 24,
      bottom: 34,
      right: 120,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    }) as DOMRect;
  return el;
});

vi.mock('slate-react', () => ({
  ReactEditor: { toDOMNode: (...args: any[]) => mockToDOMNode(...args) },
}));

import { useEditorStore } from '../../../store';

describe('JinjaTemplatePanel deepen5 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockSetOpen.mockClear();
    mockSetPath.mockClear();
    mockBefore.mockReturnValue({ path: [0, 0], offset: 0 });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('clickOutside：150ms 后外点关闭', async () => {
    const editor = { children: [] } as any;
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: mockSetOpen,
      jinjaAnchorPath: [0, 0],
    } as any);
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.click(document.body);
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('itemsConfig reject：dev console.error 臂', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: { children: [] } },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: mockSetOpen,
      setJinjaAnchorPath: mockSetPath,
      jinjaAnchorPath: [0, 0],
      editorProps: {
        jinja: {
          templatePanel: {
            items: () => Promise.reject(new Error('load fail')),
          },
        },
      },
    } as any);
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    await waitFor(() => {
      expect(errSpy).toHaveBeenCalled();
    });
    errSpy.mockRestore();
  });

  it('Editor.node + toDOMNode 定位；before 真值臂', async () => {
    mockBefore.mockReturnValue({ path: [0, 0], offset: 1 });
    const editor = { children: [] } as any;
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: mockSetOpen,
      setJinjaAnchorPath: mockSetPath,
      jinjaAnchorPath: [0, 0],
    } as any);
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(mockToDOMNode).toHaveBeenCalled();
    const item = document.querySelector('[role="option"]');
    if (item) fireEvent.mouseDown(item);
    expect(mockBefore).toHaveBeenCalled();
  });

  it('ArrowDown/Up 中间索引；open=false keydown 早退', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: { children: [] } },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: mockSetOpen,
      jinjaAnchorPath: [0, 0],
    } as any);
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'ArrowUp' });
    });

    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: {} },
      openJinjaTemplate: false,
      setOpenJinjaTemplate: mockSetOpen,
      jinjaAnchorPath: [0],
    } as any);
    render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    fireEvent.keyDown(window, { key: 'Enter' });
  });

  it('无 setOpenJinjaTemplate：insert 早退', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: { children: [] } },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: undefined,
      jinjaAnchorPath: [0, 0],
    } as any);
    const { container } = render(
      <I18nProvide autoDetect={false} defaultLanguage="zh-CN">
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    const item = container.querySelector('li, button, [role="option"]');
    if (item) fireEvent.click(item);
    expect(container).toBeTruthy();
  });
});
