import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
});
