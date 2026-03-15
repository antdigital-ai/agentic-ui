import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  useJinjaTemplatePanelStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'test-hash',
  }),
}));

vi.mock('slate', () => ({
  Editor: { node: vi.fn(() => [{}]), end: vi.fn(), before: vi.fn() },
  Transforms: { delete: vi.fn(), insertText: vi.fn() },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => {
      const el = document.createElement('div');
      el.getBoundingClientRect = vi.fn().mockReturnValue({
        left: 10,
        top: 350,
        bottom: 400,
        width: 50,
        height: 50,
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

describe('JinjaTemplatePanel', () => {
  const defaultStore = {
    markdownEditorRef: { current: null },
    markdownContainerRef: { current: document.createElement('div') },
    openJinjaTemplate: false,
    setOpenJinjaTemplate: vi.fn(),
    jinjaAnchorPath: null,
    setJinjaAnchorPath: vi.fn(),
    editorProps: {
      jinja: {
        enable: true,
        docLink: 'https://jinja.palletsprojects.com/',
        templatePanel: { trigger: '{}', enable: true },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEditorStore).mockReturnValue(defaultStore as any);
  });

  it('renders nothing when openJinjaTemplate is false', () => {
    const { container } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders panel with list and doc link when openJinjaTemplate is true', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(
      screen.getByRole('listbox', { name: 'Jinja template list' }),
    ).toBeInTheDocument();
    expect(screen.getByText('使用说明')).toBeInTheDocument();
    expect(screen.getByText('变量插值')).toBeInTheDocument();
    expect(screen.getByText('条件语句')).toBeInTheDocument();
    expect(screen.getByText('循环遍历')).toBeInTheDocument();
  });

  it('close button calls setOpenJinjaTemplate and setJinjaAnchorPath when clicked', async () => {
    const user = (await import('@testing-library/user-event')).default;
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    const closeButton = screen.getByRole('button', { name: '关闭' });
    await user.click(closeButton);

    expect(defaultStore.setOpenJinjaTemplate).toHaveBeenCalledWith(false);
    expect(defaultStore.setJinjaAnchorPath).toHaveBeenCalledWith(null);
  });

  it('renders notFoundContent when items are empty and config provides it', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
      editorProps: {
        jinja: {
          enable: true,
          templatePanel: {
            items: [],
            notFoundContent: '自定义无数据提示',
          },
        },
      },
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(screen.getByText('自定义无数据提示')).toBeInTheDocument();
  });

  it('itemsConfig 为函数时加载并展示返回的列表', async () => {
    const customItems = [
      { title: 'Custom A', template: '{{ a }}', description: 'desc' },
    ];
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
      markdownEditorRef: { current: {} },
      editorProps: {
        jinja: {
          enable: true,
          templatePanel: {
            items: () => Promise.resolve(customItems),
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
      expect(screen.getByText('Custom A')).toBeInTheDocument();
    });
  });

  it('itemsConfig 为函数且 reject 时使用 defaultItems', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
      markdownEditorRef: { current: {} },
      editorProps: {
        jinja: {
          enable: true,
          templatePanel: {
            items: () => Promise.reject(new Error('load failed')),
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
      expect(screen.getByText('变量插值')).toBeInTheDocument();
    });
    errSpy.mockRestore();
  });

  it('itemsConfig 为函数且返回非数组时使用 defaultItems', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
      markdownEditorRef: { current: {} },
      editorProps: {
        jinja: {
          enable: true,
          templatePanel: {
            items: () => Promise.resolve('not-array' as any),
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
      expect(screen.getByText('变量插值')).toBeInTheDocument();
    });
  });

  it('按 Escape 时关闭面板并 focus 编辑器', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(screen.getByRole('listbox', { name: 'Jinja template list' })).toBeInTheDocument();

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    await waitFor(() => {
      expect(defaultStore.setOpenJinjaTemplate).toHaveBeenCalledWith(false);
    });
  });

  it('点击面板外部且超过 150ms 后关闭', () => {
    vi.useFakeTimers();
    vi.mocked(useEditorStore).mockReturnValue({
      ...defaultStore,
      openJinjaTemplate: true,
      jinjaAnchorPath: [0],
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    vi.advanceTimersByTime(200);

    fireEvent.click(document.body);

    expect(defaultStore.setOpenJinjaTemplate).toHaveBeenCalledWith(false);

    vi.useRealTimers();
  });
});
