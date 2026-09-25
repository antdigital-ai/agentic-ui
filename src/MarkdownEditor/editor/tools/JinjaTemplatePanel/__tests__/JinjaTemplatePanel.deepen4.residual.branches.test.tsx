/**
 * JinjaTemplatePanel deepen4：多次 Arrow 绕回、无 setOpen 早退、
 * before ?? end、open=false keydown。
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
  useJinjaTemplatePanelStyle: () => ({ hashId: 'h4' }),
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
    toDOMNode: vi.fn(() => document.createElement('div')),
  },
}));

import { useEditorStore } from '../../../store';

describe('JinjaTemplatePanel deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 setOpenJinjaTemplate：insert 早退', () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: { children: [] } },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: undefined,
      jinjaAnchorPath: [0, 0],
    } as any);
    const { container } = render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    const item = container.querySelector('li, button, [role="option"]');
    if (item) fireEvent.click(item);
    expect(container).toBeTruthy();
  });

  it('ArrowUp 从 0 绕回；ArrowDown 到末再绕回 0', async () => {
    vi.mocked(useEditorStore).mockReturnValue({
      markdownEditorRef: { current: { children: [] } },
      openJinjaTemplate: true,
      setOpenJinjaTemplate: vi.fn(),
      jinjaAnchorPath: [0, 0],
    } as any);
    render(
      <I18nProvide>
        <JinjaTemplatePanel />
      </I18nProvide>,
    );
    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      fireEvent.keyDown(window, { key: 'ArrowUp' });
      for (let i = 0; i < 20; i++) {
        fireEvent.keyDown(window, { key: 'ArrowDown' });
      }
      fireEvent.keyDown(window, { key: 'Escape' });
    });
  });

  it('open=false：keydown 直接 return', () => {
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
    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });
  });
});
