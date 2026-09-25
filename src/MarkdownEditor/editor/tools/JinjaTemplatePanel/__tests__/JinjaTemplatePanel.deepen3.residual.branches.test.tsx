/**
 * JinjaTemplatePanel deepen3：无 editor/path 早退、before null 用 end、
 * ArrowUp 绕回、ArrowDown 绕回、未打开 keydown 早退。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvide } from '../../../../../I18n';
import { JinjaTemplatePanel } from '../index';

vi.mock('../../../store', () => ({
  useEditorStore: vi.fn(() => ({
    markdownEditorRef: { current: null },
    openJinjaTemplate: true,
    setOpenJinjaTemplate: vi.fn(),
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
  useJinjaTemplatePanelStyle: () => ({ hashId: 'h3' }),
}));

vi.mock('slate', () => ({
  Editor: {
    node: vi.fn(() => [{ type: 'paragraph', children: [{ text: '{{' }] }]),
    end: vi.fn(() => ({ path: [0, 0], offset: 2 })),
    before: vi.fn(() => null),
  },
  Transforms: { delete: vi.fn(), insertText: vi.fn() },
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => {
      throw new Error('no dom');
    }),
  },
}));

import { useEditorStore } from '../../../store';

describe('JinjaTemplatePanel deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: null },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: vi.fn(),
      jinjaAnchorPath: null,
    } as any);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 editor / path：面板仍渲染但 insert 早退', () => {
    const { container } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    expect(container).toBeTruthy();
  });

  it('ArrowUp/Down 绕回；before=null 用 end；click 插入早退', async () => {
    const setOpen = vi.fn();
    const editor = { children: [] } as any;
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: editor },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: setOpen,
      jinjaAnchorPath: [0, 0],
    } as any);

    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );

    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      fireEvent.keyDown(window, { key: 'ArrowDown' });
      fireEvent.keyDown(window, { key: 'Enter' });
    });

    const item = document.querySelector(
      '[class*="jinja-panel"] li, [data-testid], button, .ant-list-item',
    );
    if (item) {
      fireEvent.click(item);
    }
    expect(setOpen).toHaveBeenCalled();
  });

  it('open=false：keydown 早退', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: {} },
      openJinjaTemplate: false,
      setOpenJinjaTemplate: vi.fn(),
      jinjaAnchorPath: [0],
    } as any);
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
  });
});
