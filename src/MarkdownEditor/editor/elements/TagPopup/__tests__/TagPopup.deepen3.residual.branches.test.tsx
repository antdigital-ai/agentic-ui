/**
 * TagPopup deepen3：无 suggestionContext、onSelectRef/trigger 缺省、
 * mouseEnter/Leave 无 dom、autoOpen dropdown、items 静态。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SuggestionContext } from '../../../../../MarkdownInputField/Suggestion/SuggestionContext';
import { TagPopup } from '../index';

const createContext = (
  overrides: Partial<React.ContextType<typeof SuggestionContext>> = {},
) => ({
  open: false,
  setOpen: vi.fn(),
  triggerNodeContext: { current: undefined as any },
  onSelectRef: { current: undefined as ((v: string) => void) | undefined },
  isRender: true as const,
  ...overrides,
});

vi.mock('slate-react', async () => {
  const actual =
    await vi.importActual<typeof import('slate-react')>('slate-react');
  const { createEditor } = await import('slate');
  const editor = actual.withReact(createEditor());
  editor.children = [{ type: 'p', children: [{ text: 't' }] }];
  return {
    ...actual,
    useSlate: () => editor,
    ReactEditor: {
      ...actual.ReactEditor,
      toSlateNode: vi.fn(() => ({ type: 'tag' })),
      findPath: vi.fn(() => [0, 0]),
    },
  };
});

const renderTagPopup = (
  props: React.ComponentProps<typeof TagPopup>,
  ctx?: React.ContextType<typeof SuggestionContext> | null,
) => {
  if (ctx === null) {
    return render(
      <ConfigProvider>
        <TagPopup {...props} />
      </ConfigProvider>,
    );
  }
  return render(
    <ConfigProvider>
      <SuggestionContext.Provider value={ctx ?? createContext()}>
        <TagPopup {...props} />
      </SuggestionContext.Provider>
    </ConfigProvider>,
  );
};

describe('TagPopup deepen3 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 SuggestionContext：点击不抛', () => {
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        children: <span>c</span>,
      },
      null,
    );
    const el = document.querySelector('[class*="tag-popup"]');
    if (el) fireEvent.click(el);
  });

  it('context 缺 triggerNodeContext / onSelectRef：panel 仍可 setOpen', () => {
    const ctx = createContext({
      triggerNodeContext: undefined as any,
      onSelectRef: undefined as any,
    });
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        beforeOpenChange: () => true,
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).toHaveBeenCalledWith(true);
  });

  it('autoOpen dropdown：本地 open true', async () => {
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      autoOpen: true,
      items: [{ label: 'A', key: 'a' }],
      children: <span>c</span>,
    });
    await waitFor(() => {
      expect(document.querySelector('[class*="tag-popup"]')).toBeTruthy();
    });
  });

  it('静态 items + onChange 回调 path 回退', () => {
    const onChange = vi.fn();
    const onSelect = vi.fn();
    const ctx = createContext({ open: true });
    renderTagPopup(
      {
        text: '  ',
        type: 'panel',
        items: [{ label: 'X', key: 'x' }],
        onChange,
        onSelect,
        children: <span>c</span>,
      },
      ctx,
    );
    expect(onChange).toHaveBeenCalled();
    const args = onChange.mock.calls[0];
    args?.[1]?.onSelect?.('  trim  ');
    expect(onSelect).toHaveBeenCalled();
  });

  it('mouseEnter/Leave 在有 dom 时切换 data-no-focus', () => {
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      items: [{ label: 'A', key: 'a' }],
      children: <span>c</span>,
    });
    const el = document.querySelector(
      '[data-tag-popup-input]',
    ) as HTMLElement;
    expect(el).toBeTruthy();
    fireEvent.mouseEnter(el);
    expect(el.hasAttribute('data-no-focus')).toBe(false);
    fireEvent.mouseLeave(el);
    expect(el.getAttribute('data-no-focus')).toBe('');
  });
});
