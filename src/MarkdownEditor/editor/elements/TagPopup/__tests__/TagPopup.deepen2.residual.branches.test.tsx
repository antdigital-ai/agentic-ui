/**
 * TagPopup deepen2：async items、beforeOpenChange 拦截、onSelect 空 trim、
 * mouse enter/leave、autoOpen panel、items 非函数。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { ReactEditor } from 'slate-react';
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
  ctx = createContext(),
) =>
  render(
    <ConfigProvider>
      <SuggestionContext.Provider value={ctx}>
        <TagPopup {...props} />
      </SuggestionContext.Provider>
    </ConfigProvider>,
  );

describe('TagPopup deepen2 residual branches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('async items 函数返回数组；非数组忽略', async () => {
    const itemsOk = vi.fn().mockResolvedValue([{ label: 'A', key: 'a' }]);
    renderTagPopup({
      text: 't',
      type: 'dropdown',
      open: true,
      items: itemsOk,
      children: <span>c</span>,
    });
    await waitFor(() => expect(itemsOk).toHaveBeenCalled());

    const itemsBad = vi.fn().mockResolvedValue({ not: 'array' } as any);
    renderTagPopup({
      text: 't2',
      type: 'dropdown',
      open: true,
      items: itemsBad,
      children: <span>c2</span>,
    });
    await waitFor(() => expect(itemsBad).toHaveBeenCalled());
  });

  it('beforeOpenChange 返回 false 拦截 panel 打开', () => {
    const ctx = createContext();
    const setOpen = ctx.setOpen;
    renderTagPopup(
      {
        text: 't',
        type: 'panel',
        beforeOpenChange: () => false,
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(setOpen).not.toHaveBeenCalledWith(true);
  });

  it('beforeOpenChange true + dropdown 类型点击不走 panel', () => {
    const ctx = createContext();
    renderTagPopup(
      {
        text: 't',
        type: 'dropdown',
        beforeOpenChange: () => true,
        items: [{ label: 'X', key: 'x' }],
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    expect(ctx.setOpen).not.toHaveBeenCalled();
  });

  it('onSelect / onChange 空 trim 与 path 回退', async () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    renderTagPopup({
      text: 't',
      onSelect,
      onChange,
      tagRender: (p, dom) => (
        <div data-testid="tr" onClick={() => p.onSelect('   ')}>
          {dom}
        </div>
      ),
      children: <span>c</span>,
    });
    await waitFor(() => screen.getByTestId('tr'));
    fireEvent.click(screen.getByTestId('tr'));
    expect(onSelect).toHaveBeenCalledWith('', expect.any(Array), undefined);

    const props = onChange.mock.calls[0][1];
    props.onSelect('   ');
    expect(onSelect).toHaveBeenCalledWith('', expect.any(Array));
  });

  it('mouse enter/leave 切换 data-no-focus；autoOpen panel', async () => {
    const ctx = createContext();
    const { container } = renderTagPopup(
      {
        text: 'hello',
        autoOpen: true,
        type: 'panel',
        items: [{ label: 'I', key: 'i' }],
        children: <span>c</span>,
      },
      ctx,
    );
    await waitFor(() => expect(ctx.setOpen).toHaveBeenCalledWith(true));
    const input = container.querySelector('[data-tag-popup-input]')!;
    fireEvent.mouseEnter(input);
    expect(input.hasAttribute('data-no-focus')).toBe(false);
    fireEvent.mouseLeave(input);
    expect(input.getAttribute('data-no-focus')).toBe('');
  });

  it('panel onSelectRef：currentPath 失败回退 path；空 trim', async () => {
    const ctx = createContext();
    const onSelect = vi.fn();
    renderTagPopup(
      {
        text: 'panel',
        type: 'panel',
        onSelect,
        children: <span>c</span>,
      },
      ctx,
    );
    fireEvent.click(document.querySelector('[class*="tag-popup"]')!);
    await waitFor(() => expect(ctx.onSelectRef.current).toBeDefined());
    vi.mocked(ReactEditor.findPath).mockImplementationOnce(() => {
      throw new Error('gone');
    });
    ctx.onSelectRef.current?.('  ');
    expect(onSelect).toHaveBeenCalledWith('', expect.any(Array));
  });
});
