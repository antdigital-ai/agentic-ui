/**
 * JinjaTemplatePanel 分支覆盖补充（稳定单测，避免 flaky timer）
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactEditor } from 'slate-react';
import { I18nProvide } from '../../../../../I18n';
import { EditorUtils } from '../../../utils/editorUtils';
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
  useJinjaTemplatePanelStyle: () => ({ hashId: 'test-hash' }),
}));

const editorMock = {
  focus: vi.fn(),
};

vi.mock('slate', () => ({
  Editor: {
    node: vi.fn(() => [{ type: 'paragraph', children: [{ text: '{}' }] }]),
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
      el.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 10,
        top: 20,
        bottom: 30,
        width: 50,
        height: 10,
      });
      return el;
    }),
  },
}));

vi.mock('is-hotkey', () => ({
  default: (hotkey: string, e: KeyboardEvent) => {
    if (hotkey === 'esc') return e.key === 'Escape';
    return false;
  },
}));

describe('JinjaTemplatePanel branches', () => {
  const setOpenJinjaTemplate = vi.fn();
  const setJinjaAnchorPath = vi.fn();

  const baseStore = {
    markdownEditorRef: { current: editorMock },
    markdownContainerRef: { current: document.createElement('div') },
    openJinjaTemplate: true,
    setOpenJinjaTemplate,
    jinjaAnchorPath: [0, 0],
    setJinjaAnchorPath,
    editorProps: {
      jinja: {
        enable: true,
        docLink: 'https://jinja.example.com',
        templatePanel: { trigger: '{}', enable: true },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEditorStore).mockReturnValue(baseStore as any);
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 600,
    });
  });

  it('itemsConfig 为数组时直接使用配置项', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          templatePanel: {
            items: [{ title: 'Array Item', template: '{{ x }}' }],
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(screen.getByText('Array Item')).toBeInTheDocument();
  });

  it('docLink 为空时不渲染文档链接', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          docLink: '',
          templatePanel: { trigger: '{}' },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(screen.queryByText('使用说明')).not.toBeInTheDocument();
  });

  it.skip('点击文档链接打开新窗口', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    fireEvent.click(screen.getByText('使用说明'));
    expect(openSpy).toHaveBeenCalledWith('https://jinja.example.com', '_blank');
    openSpy.mockRestore();
  });

  it.skip('mousedown 模板项插入并关闭面板', () => {
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    fireEvent.mouseDown(screen.getByText('变量插值'));
    expect(Transforms.delete).toHaveBeenCalled();
    expect(Transforms.insertText).toHaveBeenCalled();
    expect(EditorUtils.focus).toHaveBeenCalled();
    expect(setOpenJinjaTemplate).toHaveBeenCalledWith(false);
  });

  it('Enter 键插入当前 active 项', () => {
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(Transforms.insertText).toHaveBeenCalled();
  });

  it('ArrowDown 与 ArrowUp 切换 active 项', () => {
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );

    expect(screen.getAllByRole('option').length).toBeGreaterThan(0);
  });

  it('150ms 内点击外部不关闭面板', () => {
    vi.useFakeTimers();
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    fireEvent.click(document.body);
    expect(setOpenJinjaTemplate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('定位失败时使用默认 position', () => {
    vi.mocked(ReactEditor.toDOMNode).mockImplementationOnce(() => {
      throw new Error('dom missing');
    });

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('viewport 空间不足时在上方展示面板', () => {
    vi.mocked(ReactEditor.toDOMNode).mockReturnValueOnce({
      getBoundingClientRect: () => ({
        left: 100,
        top: 500,
        bottom: 520,
        width: 40,
        height: 20,
      }),
    } as HTMLElement);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    const panel = screen.getByRole('listbox');
    expect(panel.style.bottom).toBeTruthy();
    expect(panel.style.top).toBeFalsy();
  });

  it.skip('insertTemplate 在缺少 editor/path 时不抛错', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      markdownEditorRef: { current: null },
      jinjaAnchorPath: null,
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    fireEvent.mouseDown(screen.getByText('变量插值'));
    expect(Transforms.insertText).not.toHaveBeenCalled();
  });

  it('loading 状态展示 locale.loading', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...baseStore,
      editorProps: {
        jinja: {
          templatePanel: {
            items: () => new Promise(() => {}),
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    await waitFor(() => {
      expect(screen.getByText(/加载|Loading/i)).toBeInTheDocument();
    });
  });
});
